from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ChatSessionCreate(BaseModel):
    title: str

class ChatSessionResponse(BaseModel):
    id: int
    user_id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: int
    session_id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class SourceNode(BaseModel):
    document_name: str
    document_id: int
    chunk_index: int
    content: str
    score: float

class ChatQueryResponse(BaseModel):
    answer: str
    session_id: int
    sources: List[SourceNode]
