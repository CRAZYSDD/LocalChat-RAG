import uuid
from datetime import datetime

from config import settings
from utils.storage import read_json, write_json


def _now_iso():
    return datetime.utcnow().isoformat()


def _normalize_message(message):
    return {
        'role': message.get('role', 'assistant'),
        'content': message.get('content', ''),
        'sources': message.get('sources', []),
        'created_at': message.get('created_at', _now_iso()),
    }


def _normalize_session(session):
    return {
        'id': session.get('id', str(uuid.uuid4())),
        'title': session.get('title', '新会话'),
        'mode': session.get('mode', 'normal'),
        'messages': [_normalize_message(message) for message in session.get('messages', [])],
        'last_message': session.get('last_message', ''),
        'updated_at': session.get('updated_at', _now_iso()),
    }


def _refresh_session_preview(session):
    messages = session.get('messages', [])
    session['last_message'] = messages[-1]['content'][:80] if messages else ''
    session['updated_at'] = _now_iso()


def list_sessions():
    sessions = read_json(settings.SESSIONS_FILE, [])
    normalized = [_normalize_session(session) for session in sessions]
    if normalized != sessions:
        write_json(settings.SESSIONS_FILE, normalized)
    return normalized


def get_session(session_id: str):
    sessions = list_sessions()
    for session in sessions:
        if session['id'] == session_id:
            return session
    return None


def create_session(title: str, mode: str = 'normal'):
    sessions = list_sessions()
    new_session = {
        'id': str(uuid.uuid4()),
        'title': title,
        'mode': mode,
        'messages': [],
        'last_message': '',
        'updated_at': _now_iso(),
    }
    sessions.insert(0, new_session)
    write_json(settings.SESSIONS_FILE, sessions)
    return new_session


def update_session(session_id: str, title=None):
    sessions = list_sessions()
    updated_session = None
    for session in sessions:
      if session['id'] != session_id:
          continue
      if title is not None:
          next_title = (title or '').strip() or '新会话'
          if session['title'] != next_title:
              session['title'] = next_title
              session['updated_at'] = _now_iso()
      updated_session = session
      break
    if updated_session:
        write_json(settings.SESSIONS_FILE, sessions)
    return updated_session


def delete_session(session_id: str):
    sessions = list_sessions()
    filtered = [session for session in sessions if session['id'] != session_id]
    write_json(settings.SESSIONS_FILE, filtered)


def append_message(session_id: str, role: str, content: str, sources=None):
    sessions = list_sessions()
    for session in sessions:
        if session['id'] == session_id:
            session['messages'].append({
                'role': role,
                'content': content,
                'sources': sources or [],
                'created_at': _now_iso(),
            })
            _refresh_session_preview(session)
            break
    write_json(settings.SESSIONS_FILE, sessions)


def remove_last_assistant_message(session_id: str):
    sessions = list_sessions()
    updated = False
    for session in sessions:
        if session['id'] != session_id:
            continue
        if session.get('messages') and session['messages'][-1].get('role') == 'assistant':
            session['messages'].pop()
            _refresh_session_preview(session)
            updated = True
        break

    if updated:
        write_json(settings.SESSIONS_FILE, sessions)


def get_history(session_id: str):
    session = get_session(session_id)
    if session:
        return session.get('messages', [])
    return []
