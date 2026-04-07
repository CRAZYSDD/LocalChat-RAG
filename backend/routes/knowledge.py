from fastapi import APIRouter, File, HTTPException, UploadFile

from services.knowledge_service import knowledge_service

router = APIRouter(prefix='/api/knowledge', tags=['knowledge'])


@router.post('/upload')
def upload(file: UploadFile = File(...)):
    try:
        return knowledge_service.upload(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f'文件上传失败：{exc}') from exc


@router.get('/files')
def get_files():
    docs = knowledge_service.list_files()
    return [{key: value for key, value in doc.items() if key != 'chunks'} for doc in docs]


@router.delete('/files/{file_id}')
def delete_file(file_id: str):
    knowledge_service.delete(file_id)
    return {'success': True}


@router.post('/reindex')
def reindex():
    return knowledge_service.reindex()
