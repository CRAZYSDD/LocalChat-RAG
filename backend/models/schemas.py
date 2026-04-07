from typing import List, Optional

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class SessionCreateRequest(BaseModel):
    title: str = '新会话'
    mode: str = 'normal'


class SessionUpdateRequest(BaseModel):
    title: Optional[str] = None


class MessageItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    sessionId: str
    question: str
    history: List[MessageItem] = Field(default_factory=list)
    mode: str = 'normal'
    stream: bool = False
    regenerate: bool = False


class SettingsPayload(BaseModel):
    model_path: Optional[str] = None
    embedding_model_path: Optional[str] = None
    max_new_tokens: Optional[int] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    repetition_penalty: Optional[float] = None
    streaming_enabled: Optional[bool] = None


class RagQueryRequest(BaseModel):
    sessionId: str
    question: str
    history: List[MessageItem] = Field(default_factory=list)
    top_k: int = 3
    mode: str = 'rag'
    regenerate: bool = False
