from contextlib import contextmanager
from database.connection import SessionLocal
from database.models import Chat, Message, Document


@contextmanager
def get_db():
    """Context manager — guarantees session is closed even if an exception occurs."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def create_chat(title: str) -> Chat:
    with get_db() as db:
        chat = Chat(title=title)
        db.add(chat)
        db.flush()
        db.refresh(chat)
        # detach so it can be used outside the session
        db.expunge(chat)
    return chat


def save_message(chat_id: int, role: str, content: str) -> None:
    with get_db() as db:
        db.add(Message(chat_id=chat_id, role=role, content=content))


def save_document(filename: str, chunk_count: int) -> Document:
    with get_db() as db:
        doc = Document(filename=filename, chunk_count=chunk_count)
        db.add(doc)
        db.flush()
        db.refresh(doc)
        db.expunge(doc)
    return doc


def get_documents():
    with get_db() as db:
        docs = db.query(Document).order_by(Document.created_at.desc()).all()
        # expunge all so they can be serialised outside the session
        for d in docs:
            db.expunge(d)
    return docs


def get_document_by_filename(filename: str):
    with get_db() as db:
        doc = db.query(Document).filter(Document.filename == filename).first()
        if doc:
            db.expunge(doc)
    return doc


def delete_chat(chat_id: int) -> bool:
    with get_db() as db:
        db.query(Message).filter(Message.chat_id == chat_id).delete()
        deleted = db.query(Chat).filter(Chat.id == chat_id).delete()
    return deleted > 0


def delete_document(document_id: int):
    """Returns filename so caller can also purge ChromaDB chunks."""
    with get_db() as db:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return None
        filename = doc.filename
        db.delete(doc)
    return filename


def delete_document_by_filename(filename: str) -> bool:
    """Used for deduplication — removes existing record before re-upload."""
    with get_db() as db:
        deleted = db.query(Document).filter(Document.filename == filename).delete()
    return deleted > 0
