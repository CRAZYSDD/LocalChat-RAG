from collections import Counter
from datetime import datetime, timedelta

from config import settings
from utils.storage import read_json, write_json


def _default_stats():
    return {
        'today_questions': 0,
        'rag_calls': 0,
        'retrieval_hit_rate': 0.86,
        'trend': {
            'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            'questions': [12, 19, 11, 24, 18, 27, 16],
            'rag_calls': [4, 8, 5, 10, 7, 12, 9]
        },
        'last_updated': datetime.utcnow().isoformat()
    }


def read_stats():
    stats = read_json(settings.STATS_FILE, _default_stats())
    write_json(settings.STATS_FILE, stats)
    return stats


def increment(key: str):
    stats = read_stats()
    stats[key] = stats.get(key, 0) + 1
    stats['last_updated'] = datetime.utcnow().isoformat()
    write_json(settings.STATS_FILE, stats)


def _parse_datetime(value):
    if not value:
        return None
    try:
        normalized = str(value).replace('Z', '+00:00')
        return datetime.fromisoformat(normalized)
    except ValueError:
        return None


def _message_date(message):
    parsed = _parse_datetime(message.get('created_at'))
    return parsed.date() if parsed else None


def _last_seven_days():
    today = datetime.utcnow().date()
    return [today - timedelta(days=offset) for offset in range(6, -1, -1)]


def _is_rag_session(session):
    return session.get('mode') == 'rag'


def _mode_distribution(sessions):
    normal_count = sum(1 for session in sessions if session.get('mode') != 'rag')
    rag_count = sum(1 for session in sessions if session.get('mode') == 'rag')
    return [
        {'name': '普通对话', 'value': normal_count},
        {'name': 'RAG 问答', 'value': rag_count},
    ]


def _knowledge_summary(documents):
    status_counts = Counter(document.get('status', 'unknown') for document in documents)
    total_chunks = sum(document.get('chunk_count', 0) for document in documents)
    return {
        'total_chunks': total_chunks,
        'status_labels': ['已上传', '已切分', '已向量化', '其他'],
        'status_values': [
            status_counts.get('uploaded', 0),
            status_counts.get('chunked', 0),
            status_counts.get('indexed', 0),
            sum(count for status, count in status_counts.items() if status not in {'uploaded', 'chunked', 'indexed'}),
        ],
    }


def _recent_sessions(sessions):
    def sort_key(session):
        parsed = _parse_datetime(session.get('updated_at'))
        return parsed or datetime.min

    sorted_sessions = sorted(sessions, key=sort_key, reverse=True)
    return [
        {
            'id': session.get('id'),
            'title': session.get('title', '未命名会话'),
            'mode': session.get('mode', 'normal'),
            'message_count': len(session.get('messages', [])),
            'updated_at': session.get('updated_at', ''),
        }
        for session in sorted_sessions[:6]
    ]


def _actual_metrics(sessions):
    today = datetime.utcnow().date()
    days = _last_seven_days()
    question_counts = Counter()
    rag_counts = Counter()

    today_questions = 0
    rag_calls = 0

    for session in sessions:
        is_rag_session = _is_rag_session(session)
        session_messages = session.get('messages', [])
        for message in session_messages:
            message_day = _message_date(message)
            role = message.get('role')

            if role == 'user':
                if message_day == today:
                    today_questions += 1
                if message_day:
                    question_counts[message_day] += 1
                if is_rag_session:
                    rag_calls += 1
                    if message_day:
                        rag_counts[message_day] += 1

    return {
        'today_questions': today_questions,
        'rag_calls': rag_calls,
        'trend': {
            'labels': [day.strftime('%m-%d') for day in days],
            'questions': [question_counts[day] for day in days],
            'rag_calls': [rag_counts[day] for day in days],
        },
    }


def dashboard_payload(sessions, documents):
    metrics = _actual_metrics(sessions)
    document_total = len(documents)
    return {
        'cards': [
            {'label': '会话总数', 'value': len(sessions), 'description': '来自当前会话列表的实时统计'},
            {'label': '今日提问数', 'value': metrics['today_questions'], 'description': '按用户消息创建时间实时计算'},
            {'label': '文档总数', 'value': document_total, 'description': '支持 txt / md / pdf'},
            {'label': 'RAG 调用次数', 'value': metrics['rag_calls'], 'description': '按 RAG 会话中的用户提问计算'}
        ],
        'trend': metrics['trend'],
        'mode_distribution': _mode_distribution(sessions),
        'knowledge': _knowledge_summary(documents),
        'recent_sessions': _recent_sessions(sessions),
    }
