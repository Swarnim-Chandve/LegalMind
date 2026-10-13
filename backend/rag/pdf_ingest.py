# rag/pdf_ingest.py

from rag.pdf_loader import load_pdf
from rag.chunker import chunk_text
from rag.vectordb import collection


def ingest_pdf(file_path, filename):

    text = load_pdf(file_path)

    chunks = chunk_text(text)

    for i, chunk in enumerate(chunks):

        collection.add(
            ids=[f"{filename}_{i}"],
            documents=[chunk],
            metadatas=[
                {
                    "source": filename
                }
            ]
        )

    return len(chunks)
