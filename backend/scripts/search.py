"""Dev script — directly queries ChromaDB, prints raw results."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from rag.vectordb import collection

question = "What is the notice period?"

results = collection.query(query_texts=[question], n_results=2)
print(results["documents"])
print(results["metadatas"])
