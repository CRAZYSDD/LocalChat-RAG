from fastapi import APIRouter, HTTPException

from models.schemas import SessionCreateRequest, SessionUpdateRequest
from services.session_service import create_session, delete_session, get_session, list_sessions, update_session

router = APIRouter(prefix='/api/sessions', tags=['sessions'])


@router.get('')
def get_sessions():
    sessions = list_sessions()
    return [
        {
            'id': item['id'],
            'title': item['title'],
            'mode': item.get('mode', 'normal'),
            'last_message': item.get('last_message', ''),
            'updated_at': item['updated_at'],
        }
        for item in sessions
    ]


@router.get('/{session_id}')
def get_session_detail(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail='会话不存在')
    return {
        'id': session['id'],
        'title': session['title'],
        'mode': session.get('mode', 'normal'),
        'last_message': session.get('last_message', ''),
        'updated_at': session['updated_at'],
        'messages': session.get('messages', []),
    }


@router.post('')
def post_session(payload: SessionCreateRequest):
    session = create_session(payload.title, payload.mode)
    return {
        'id': session['id'],
        'title': session['title'],
        'mode': session['mode'],
        'last_message': session['last_message'],
        'updated_at': session['updated_at'],
    }


@router.put('/{session_id}')
def put_session(session_id: str, payload: SessionUpdateRequest):
    session = update_session(session_id, title=payload.title)
    if not session:
        raise HTTPException(status_code=404, detail='会话不存在')
    return {
        'id': session['id'],
        'title': session['title'],
        'mode': session.get('mode', 'normal'),
        'last_message': session.get('last_message', ''),
        'updated_at': session['updated_at'],
    }


@router.delete('/{session_id}')
def delete_session_route(session_id: str):
    delete_session(session_id)
    return {'success': True}
