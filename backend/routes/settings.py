from fastapi import APIRouter

from config import ROOT_DIR, settings
from models.schemas import SettingsPayload
from services.knowledge_service import knowledge_service
from services.model_service import model_service

router = APIRouter(prefix='/api', tags=['settings'])
ENV_FILE = ROOT_DIR / '.env'


def resource_status(loaded, error):
    if loaded:
        return 'loaded'
    if error:
        return 'error'
    return 'not_loaded'


def current_settings():
    model_status = resource_status(model_service.loaded, model_service.last_error)
    embedding_status = resource_status(knowledge_service.embedding_model is not None, knowledge_service.last_error)
    return {
        'model_path': settings.MODEL_PATH,
        'embedding_model_path': settings.EMBEDDING_MODEL_PATH,
        'max_new_tokens': settings.MAX_NEW_TOKENS,
        'temperature': settings.TEMPERATURE,
        'top_p': settings.TOP_P,
        'repetition_penalty': settings.REPETITION_PENALTY,
        'streaming_enabled': settings.STREAMING_ENABLED,
        'model_loaded': model_service.loaded,
        'embedding_model_loaded': knowledge_service.embedding_model is not None,
        'model_status': model_status,
        'embedding_model_status': embedding_status,
        'model_error': model_service.last_error,
        'embedding_model_error': knowledge_service.last_error,
    }


def persist_settings():
    env_values = {
        'MODEL_PATH': settings.MODEL_PATH,
        'EMBEDDING_MODEL_PATH': settings.EMBEDDING_MODEL_PATH,
        'VECTOR_DB_PATH': settings.VECTOR_DB_PATH,
        'UPLOAD_DIR': settings.UPLOAD_DIR,
        'MAX_NEW_TOKENS': str(settings.MAX_NEW_TOKENS),
        'TEMPERATURE': str(settings.TEMPERATURE),
        'TOP_P': str(settings.TOP_P),
        'REPETITION_PENALTY': str(settings.REPETITION_PENALTY),
        'STREAMING_ENABLED': 'true' if settings.STREAMING_ENABLED else 'false',
    }

    existing_lines = []
    seen_keys = set()
    if ENV_FILE.exists():
        existing_lines = ENV_FILE.read_text(encoding='utf-8').splitlines()

    updated_lines = []
    for line in existing_lines:
        stripped = line.strip()
        if not stripped or stripped.startswith('#') or '=' not in line:
            updated_lines.append(line)
            continue

        key, _ = line.split('=', 1)
        key = key.strip()
        if key in env_values:
            updated_lines.append(f'{key}={env_values[key]}')
            seen_keys.add(key)
        else:
            updated_lines.append(line)

    for key, value in env_values.items():
        if key not in seen_keys:
            updated_lines.append(f'{key}={value}')

    ENV_FILE.write_text('\n'.join(updated_lines) + '\n', encoding='utf-8')


def preload_resources():
    try:
        model_service.load()
    except Exception:
        pass
    try:
        knowledge_service.load_embedding_model()
    except Exception:
        pass


@router.get('/settings')
def get_settings():
    return current_settings()


@router.post('/settings/load')
def load_settings_resources():
    preload_resources()
    return current_settings()


@router.put('/settings')
def update_settings(payload: SettingsPayload):
    if payload.model_path:
        settings.MODEL_PATH = payload.model_path
        model_service.reset()
    if payload.embedding_model_path:
        settings.EMBEDDING_MODEL_PATH = payload.embedding_model_path
        knowledge_service.reset()
    if payload.max_new_tokens is not None:
        settings.MAX_NEW_TOKENS = payload.max_new_tokens
    if payload.temperature is not None:
        settings.TEMPERATURE = payload.temperature
    if payload.top_p is not None:
        settings.TOP_P = payload.top_p
    if payload.repetition_penalty is not None:
        settings.REPETITION_PENALTY = payload.repetition_penalty
    if payload.streaming_enabled is not None:
        settings.STREAMING_ENABLED = payload.streaming_enabled
    persist_settings()
    preload_resources()
    return current_settings()
