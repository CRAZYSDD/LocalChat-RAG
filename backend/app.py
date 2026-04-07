from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.knowledge import router as knowledge_router
from routes.sessions import router as sessions_router
from routes.settings import router as settings_router
from routes.stats import router as stats_router

app = FastAPI(title='LocalChat RAG Backend')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)

app.include_router(auth_router)
app.include_router(sessions_router)
app.include_router(chat_router)
app.include_router(knowledge_router)
app.include_router(settings_router)
app.include_router(stats_router)


@app.get('/')
def read_root():
    return {'message': 'LocalChat RAG backend is running'}


if __name__ == '__main__':
    import uvicorn

    uvicorn.run('app:app', host='127.0.0.1', port=8000, reload=True)
