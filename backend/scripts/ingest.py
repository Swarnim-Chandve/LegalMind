"""
Bulk-ingest all .txt contracts into ChromaDB and register them in Postgres.
Run from backend/: python scripts/ingest.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import glob
from rag.loader import load_text
from rag.chunker import chunk_text
from rag.vectordb import collection
from database.crud import get_document_by_filename, save_document, delete_document_by_filename

files = glob.glob("data/contracts/*.txt")

for file_path in files:
    text = load_text(file_path)
    chunks = chunk_text(text)
    filename = os.path.basename(file_path)

    # Dedup — remove existing entry before re-ingesting
    if get_document_by_filename(filename):
        try:
            collection.delete(where={"source": filename})
        except Exception:
            pass
        delete_document_by_filename(filename)

    for i, chunk in enumerate(chunks):
        collection.add(
            ids=[f"{filename}_{i}"],
            documents=[chunk],
            metadatas=[{"source": filename}]
        )

    # Track in Postgres so Knowledge Base sidebar shows these docs
    save_document(filename, len(chunks))

    print(f"Ingested {filename} ({len(chunks)} chunks)")

print("All documents ingested successfully.")
