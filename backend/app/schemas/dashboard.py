from pydantic import BaseModel
from typing import Dict, List, Any

class ChatCountByDate(BaseModel):
    date: str
    count: int

class DashboardStatsResponse(BaseModel):
    total_documents: int
    total_size_bytes: int
    total_chats: int
    total_messages: int
    document_types_distribution: Dict[str, int]
    chat_timeline: List[ChatCountByDate]
