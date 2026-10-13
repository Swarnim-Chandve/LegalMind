"""
Dev script — directly queries ChromaDB and calls ask_llm.
Run from backend/: python scripts/rag_query.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from rag.vectordb import collection
from rag.llm_openai import ask_llm

question = "What is the notice period?"

results = collection.query(query_texts=[question], n_results=1)
context = "\n".join(results["documents"][0])

print("Context:", context)
print("\nAnswer:", ask_llm(context, question))
