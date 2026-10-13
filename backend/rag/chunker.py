def chunk_text(text, chunk_size=800, overlap=150):
    """
    Split text into overlapping chunks.
    Default: 800 chars per chunk, 150 char overlap.
    Tries to break at sentence boundaries ('. ') to avoid mid-sentence splits.
    """
    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + chunk_size, text_len)

        # Try to break at a sentence boundary within the last 100 chars of the window
        if end < text_len:
            boundary = text.rfind(". ", start, end)
            if boundary != -1 and boundary > start + chunk_size // 2:
                end = boundary + 1  # include the period

        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)

        start += chunk_size - overlap

    return chunks
