import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

ENV_FILE = ROOT_DIR / '.env'
ENV_EXAMPLE_FILE = ROOT_DIR / '.env.example'

if ENV_FILE.exists():
    load_dotenv(ENV_FILE, override=True)
elif ENV_EXAMPLE_FILE.exists():
    load_dotenv(ENV_EXAMPLE_FILE, override=True)


def resolve_path(value: str, base_dir: Path):
    path = Path(value)
    if path.is_absolute():
        return str(path)
    return str((base_dir / path).resolve())


class Settings:
    MODEL_PATH = resolve_path(os.getenv('MODEL_PATH', './models/your_local_llm'), ROOT_DIR)
    EMBEDDING_MODEL_PATH = resolve_path(os.getenv('EMBEDDING_MODEL_PATH', './models/your_local_embedding_model'), ROOT_DIR)
    VECTOR_DB_PATH = resolve_path(os.getenv('VECTOR_DB_PATH', './backend/data/faiss'), ROOT_DIR)
    UPLOAD_DIR = resolve_path(os.getenv('UPLOAD_DIR', './backend/data/uploads'), ROOT_DIR)
    MAX_NEW_TOKENS = int(os.getenv('MAX_NEW_TOKENS', '512'))
    TEMPERATURE = float(os.getenv('TEMPERATURE', '0.7'))
    TOP_P = float(os.getenv('TOP_P', '0.9'))
    REPETITION_PENALTY = float(os.getenv('REPETITION_PENALTY', '1.08'))
    STREAMING_ENABLED = os.getenv('STREAMING_ENABLED', 'true').lower() == 'true'
    MAX_HISTORY_MESSAGES = int(os.getenv('MAX_HISTORY_MESSAGES', '4'))
    MAX_HISTORY_CHARS_PER_MESSAGE = int(os.getenv('MAX_HISTORY_CHARS_PER_MESSAGE', '600'))
    MAX_RAG_CONTEXT_CHARS = int(os.getenv('MAX_RAG_CONTEXT_CHARS', '1800'))
    SESSIONS_FILE = BASE_DIR / 'data' / 'sessions.json'
    DOCS_FILE = BASE_DIR / 'data' / 'documents.json'
    STATS_FILE = BASE_DIR / 'data' / 'stats.json'


settings = Settings()

Path(settings.VECTOR_DB_PATH).mkdir(parents=True, exist_ok=True)
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
settings.SESSIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
