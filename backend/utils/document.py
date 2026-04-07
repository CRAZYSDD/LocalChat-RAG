from pathlib import Path
from pypdf import PdfReader


def parse_document(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix in {'.txt', '.md'}:
        return file_path.read_text(encoding='utf-8', errors='ignore')
    if suffix == '.pdf':
        reader = PdfReader(str(file_path))
        return '\n'.join(page.extract_text() or '' for page in reader.pages)
    raise ValueError(f'Unsupported file type: {suffix}')


def split_text(text: str, chunk_size: int = 500, overlap: int = 80):
    cleaned = ' '.join(text.split())
    chunks = []
    start = 0
    while start < len(cleaned):
        end = min(len(cleaned), start + chunk_size)
        chunks.append(cleaned[start:end])
        if end == len(cleaned):
            break
        start = max(end - overlap, 0)
    return [chunk for chunk in chunks if chunk.strip()]
