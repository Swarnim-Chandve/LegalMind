import os
import logging
import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database.connection import SessionLocal, engine
from database.models import Chat, Message, Base

from database.crud import (
    create_chat,
    save_message,
    save_document,
    get_documents,
    get_document_by_filename,
    delete_chat,
    delete_document,
    delete_document_by_filename,
)
from rag.pdf_ingest import ingest_pdf
from rag.vectordb import collection
from rag.llm_openai import ask_llm_general
from core.langgraph_workflow import app as langgraph_app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="LegalMind API", version="1.0.0")

# Ensure database tables exist (SQLite / Postgres)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "data/contracts"


def _ensure_upload_dir() -> None:
    os.makedirs(UPLOAD_DIR, exist_ok=True)


class QuestionRequest(BaseModel):
    question: str
    document: str | None = None
    documents: list[str] | None = None
    source_filter: str | list[str] | None = None


def _normalize_topic_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def _detect_topic_from_text(text: str) -> str | None:
    normalized = _normalize_topic_text(text)
    topic_map = {
        "vendor_agreement": [
            "vendor agreement", "vendor", "supplier", "service agreement",
            "supply agreement", "procurement agreement", "goods and services"
        ],
        "nda": [
            "nda", "non disclosure", "non disclosure agreement", "non disclosure agreement",
            "confidential information", "confidentiality"
        ],
        "employment": [
            "employment agreement", "employee", "employer", "employment",
            "work contract", "termination notice"
        ],
        "privacy_policy": [
            "privacy policy", "privacy", "gdpr", "data protection",
            "personal data", "data subject", "retention", "cookie",
            "processor", "controller"
        ],
    }

    for topic, keywords in topic_map.items():
        if any(keyword in normalized for keyword in keywords):
            return topic
    return None


def _detect_topic_from_document_name(filename: str) -> str | None:
    normalized = _normalize_topic_text(filename)
    if "nda" in normalized or "non disclosure" in normalized:
        return "nda"
    if "vendor" in normalized or "supplier" in normalized:
        return "vendor_agreement"
    if "employment" in normalized or "employee" in normalized:
        return "employment"
    if "privacy" in normalized or "gdpr" in normalized or "policy" in normalized:
        return "privacy_policy"
    return None


def _display_topic_label(topic: str) -> str:
    label_map = {
        "vendor_agreement": "Vendor Agreement",
        "nda": "NDA",
        "employment": "Employment Agreement",
        "privacy_policy": "Privacy Policy",
    }
    return label_map.get(topic, topic.replace("_", " ").title())


def validate_document_scope(question: str, source_filter: str | list[str] | None) -> str | None:
    if not question or not source_filter:
        return None

    selected_docs = source_filter if isinstance(source_filter, list) else [source_filter]
    doc_topics = {
        _detect_topic_from_document_name(os.path.basename(str(doc)))
        for doc in selected_docs if str(doc).strip()
    }
    doc_topics = {topic for topic in doc_topics if topic}

    if not doc_topics:
        return None

    question_topic = _detect_topic_from_text(question)
    if question_topic is None or len(doc_topics) == 0:
        return None

    if doc_topics == {question_topic}:
        return None

    doc_label = " | ".join(_display_topic_label(topic) for topic in sorted(doc_topics))
    question_label = _display_topic_label(question_topic)
    return (
        f"The selected document appears to be {doc_label}, but your question is about a {question_label}. "
        "Please choose the matching document or ask about the document that is actually selected."
    )


@app.post("/ask")
def ask_general(request: QuestionRequest):
    """General legal Q&A — no document upload required, no RAG pipeline."""
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")
    try:
        answer = ask_llm_general(question)
    except Exception as exc:
        logger.error("General LLM call failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Could not get answer: {exc}")
    return {"answer": answer}


def _clean_title(question: str) -> str:
    """Strip leading slashes/whitespace so chat titles look sensible."""
    return question.lstrip("/ \t").strip()[:60] or "Untitled"


@app.post("/analyze")
def analyze(request: QuestionRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    selected_document = request.document or request.source_filter
    if isinstance(selected_document, str):
        source_filter = [selected_document.strip()] if selected_document.strip() else None
    elif isinstance(selected_document, list):
        source_filter = [item.strip() for item in selected_document if isinstance(item, str) and item.strip()]
        if not source_filter:
            source_filter = None
    else:
        source_filter = None

    if request.documents:
        source_filter = [item.strip() for item in request.documents if isinstance(item, str) and item.strip()]
        if not source_filter:
            source_filter = None

    mismatch_message = validate_document_scope(question, source_filter)

    try:
        chat = create_chat(_clean_title(question))
        save_message(chat.id, "user", question)
    except Exception as exc:
        logger.error("DB error saving chat: %s", exc)
        raise HTTPException(status_code=500, detail="Database error. Please try again.")

    if mismatch_message:
        try:
            save_message(chat.id, "assistant", mismatch_message)
        except Exception as exc:
            logger.warning("Could not save mismatch message: %s", exc)
        return {
            "chat_id": chat.id,
            "answer": mismatch_message,
            "sources": [],
            "workflow": [],
            "risk_level": "Unknown",
            "issues": [],
            "risk_plain_english": "The selected document does not match the question topic.",
        }

    try:
        payload = {
            "question": question,
            "events": [],
        }
        if source_filter:
            payload["source_filter"] = source_filter
        result = langgraph_app.invoke(payload)
    except Exception as exc:
        logger.error("LangGraph pipeline failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}")

    try:
        save_message(chat.id, "assistant", result["answer"])
    except Exception as exc:
        logger.warning("Could not save assistant message: %s", exc)

    return {
        "chat_id": chat.id,
        "answer": result.get("answer", ""),
        "sources": result.get("sources", []),
        "workflow": result.get("events", []),
        "risk_level": result.get("risk_level", "Unknown"),
        "issues": result.get("issues", []),
        "risk_plain_english": result.get("risk_plain_english", ""),
        "redlines": result.get("redlines", []),
    }



@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Server-side file type validation
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content_type = file.content_type or ""
    if content_type and content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    _ensure_upload_dir()
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        with open(file_path, "wb") as f:
            f.write(contents)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("File write error: %s", exc)
        raise HTTPException(status_code=500, detail="Could not save the uploaded file.")

    # Deduplication — remove existing chunks and DB record for this filename
    existing = get_document_by_filename(file.filename)
    if existing:
        logger.info("Duplicate upload detected for '%s' — re-ingesting.", file.filename)
        try:
            collection.delete(where={"source": file.filename})
        except Exception as exc:
            logger.warning("ChromaDB dedup delete failed: %s", exc)
        delete_document_by_filename(file.filename)

    try:
        chunks = ingest_pdf(file_path, file.filename)
    except Exception as exc:
        logger.error("PDF ingest failed: %s", exc)
        raise HTTPException(status_code=422, detail=f"Could not process PDF: {exc}")

    try:
        save_document(file.filename, chunks)
    except Exception as exc:
        logger.warning("Could not save document record: %s", exc)

    return {"file": file.filename, "chunks": chunks}


@app.get("/chats")
def get_chats():
    try:
        db = SessionLocal()
        chats = db.query(Chat).order_by(Chat.created_at.desc()).all()
        db.close()
        return chats
    except Exception as exc:
        logger.error("Failed to fetch chats: %s", exc)
        raise HTTPException(status_code=500, detail="Could not fetch chats.")


@app.get("/chat/{chat_id}")
def get_chat(chat_id: int):
    try:
        db = SessionLocal()
        messages = db.query(Message).filter(Message.chat_id == chat_id).all()
        db.close()
        return messages
    except Exception as exc:
        logger.error("Failed to fetch chat %d: %s", chat_id, exc)
        raise HTTPException(status_code=500, detail="Could not fetch chat messages.")


@app.delete("/chat/{chat_id}")
def remove_chat(chat_id: int):
    try:
        success = delete_chat(chat_id)
    except Exception as exc:
        logger.error("Failed to delete chat %d: %s", chat_id, exc)
        raise HTTPException(status_code=500, detail="Could not delete chat.")
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found.")
    return {"deleted": chat_id}


@app.get("/documents")
def documents():
    try:
        return get_documents()
    except Exception as exc:
        logger.error("Failed to fetch documents: %s", exc)
        raise HTTPException(status_code=500, detail="Could not fetch documents.")


@app.delete("/document/{document_id}")
def remove_document(document_id: int):
    try:
        filename = delete_document(document_id)
    except Exception as exc:
        logger.error("Failed to delete document %d: %s", document_id, exc)
        raise HTTPException(status_code=500, detail="Could not delete document.")

    if filename is None:
        raise HTTPException(status_code=404, detail="Document not found.")

    try:
        collection.delete(where={"source": filename})
    except Exception as exc:
        logger.warning("ChromaDB chunk delete failed for '%s': %s", filename, exc)

    return {"deleted": document_id, "filename": filename}






