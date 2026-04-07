import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from models.schemas import ChatRequest, RagQueryRequest
from services.knowledge_service import knowledge_service
from services.model_service import model_service
from services.session_service import append_message, get_history, remove_last_assistant_message
from services.stats_service import increment

router = APIRouter(prefix='/api', tags=['chat'])


def sse_event(payload):
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def resolved_history(session_id, history, regenerate=False):
    if regenerate:
        return history
    return history or get_history(session_id)


def persist_answer(session_id, question, answer, sources=None, regenerate=False):
    if not regenerate:
        append_message(session_id, 'user', question)
    append_message(session_id, 'assistant', answer, sources or [])


@router.post('/chat')
def chat(payload: ChatRequest):
    history = resolved_history(payload.sessionId, payload.history, payload.regenerate)
    if payload.regenerate:
        remove_last_assistant_message(payload.sessionId)
    answer = model_service.generate(history, payload.question)
    persist_answer(payload.sessionId, payload.question, answer, [], payload.regenerate)
    increment('today_questions')
    return {'sessionId': payload.sessionId, 'answer': answer, 'sources': []}


@router.post('/chat/stream')
def stream_chat(payload: ChatRequest):
    history = resolved_history(payload.sessionId, payload.history, payload.regenerate)
    if payload.regenerate:
        remove_last_assistant_message(payload.sessionId)
    sources = []
    context = ''
    if payload.mode == 'rag':
        sources = knowledge_service.search(payload.question, top_k=3)
        context = '\n\n'.join(item['content'] for item in sources)

    def event_generator():
        answer_parts = []
        try:
            for chunk in model_service.stream_generate(history, payload.question, context):
                answer_parts.append(chunk)
                yield sse_event({'type': 'delta', 'content': chunk})

            answer = ''.join(answer_parts).strip()
            persist_answer(
                payload.sessionId,
                payload.question,
                answer,
                sources if payload.mode == 'rag' else [],
                payload.regenerate,
            )
            increment('today_questions')
            if payload.mode == 'rag':
                increment('rag_calls')
                yield sse_event({'type': 'sources', 'sources': sources})
            yield sse_event({'type': 'done', 'answer': answer, 'sources': sources})
        except Exception as exc:
            yield sse_event({'type': 'error', 'message': str(exc)})

    return StreamingResponse(
        event_generator(),
        media_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    )


@router.post('/chat/stop/{session_id}')
def stop_chat(session_id: str):
    return {'success': True, 'sessionId': session_id}


@router.post('/rag/query')
def rag_query(payload: RagQueryRequest):
    history = resolved_history(payload.sessionId, payload.history, payload.regenerate)
    if payload.regenerate:
        remove_last_assistant_message(payload.sessionId)
    sources = knowledge_service.search(payload.question, top_k=payload.top_k)
    context = '\n\n'.join(item['content'] for item in sources)
    answer = model_service.generate(history, payload.question, context)
    persist_answer(payload.sessionId, payload.question, answer, sources, payload.regenerate)
    increment('today_questions')
    increment('rag_calls')
    return {'sessionId': payload.sessionId, 'answer': answer, 'sources': sources}
