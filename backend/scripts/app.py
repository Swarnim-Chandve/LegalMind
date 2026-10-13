"""Dev script — loads nda.txt, chunks it and prints chunks."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from rag.loader import load_text
from rag.chunker import chunk_text

text = load_text("data/contracts/nda.txt")
chunks = chunk_text(text)

print(f"Total Chunks: {len(chunks)}")
for i, chunk in enumerate(chunks):
    print(f"\n--- Chunk {i+1} ---")
    print(chunk)
