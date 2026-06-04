from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class DocumentResponse(BaseModel):
    id: int
    filename: str
    filepath: str
    file_type: str
    file_size: int
    upload_date: datetime
    status: str
    chunk_count: int
    user_id: int

    class Config:
        from_attributes = True
