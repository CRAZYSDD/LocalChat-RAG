from fastapi import APIRouter
from services.knowledge_service import knowledge_service
from services.session_service import list_sessions
from services.stats_service import dashboard_payload

router = APIRouter(prefix='/api/stats', tags=['stats'])


@router.get('/dashboard')
def get_dashboard():
    return dashboard_payload(list_sessions(), knowledge_service.list_files())
