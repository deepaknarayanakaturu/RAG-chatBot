from datetime import datetime
from collections import defaultdict
from sqlalchemy.orm import Session
from app.database.models import Document, ChatSession, ChatMessage
from app.schemas.dashboard import DashboardStatsResponse, ChatCountByDate

def get_dashboard_stats(db: Session, user_id: int) -> DashboardStatsResponse:
    # 1. Fetch total documents
    total_docs = db.query(Document).filter(Document.user_id == user_id).count()
    
    # 2. Fetch total file sizes
    size_queries = db.query(Document).filter(Document.user_id == user_id).all()
    total_size_bytes = sum(doc.file_size for doc in size_queries)
    
    # 3. Fetch total chat sessions
    total_chats = db.query(ChatSession).filter(ChatSession.user_id == user_id).count()
    
    # 4. Fetch total messages across user's sessions
    total_messages = (
        db.query(ChatMessage)
        .join(ChatSession)
        .filter(ChatSession.user_id == user_id)
        .count()
    )
    
    # 5. Calculate document formats distribution
    distribution = defaultdict(int)
    for doc in size_queries:
        distribution[doc.file_type] += 1
        
    # Ensure default keys are always present for charts
    for ext in ["pdf", "docx", "txt"]:
        if ext not in distribution:
            distribution[ext] = 0
            
    # 6. Build chat timeline (group by date)
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).all()
    timeline_dict = defaultdict(int)
    for s in sessions:
        date_str = s.created_at.strftime("%Y-%m-%d")
        timeline_dict[date_str] += 1
        
    sorted_dates = sorted(timeline_dict.keys())
    chat_timeline = [
        ChatCountByDate(date=d, count=timeline_dict[d]) for d in sorted_dates
    ]
    
    # Fallback to make sure timeline has at least one node
    if not chat_timeline:
        chat_timeline.append(
            ChatCountByDate(date=datetime.utcnow().strftime("%Y-%m-%d"), count=0)
        )
        
    return DashboardStatsResponse(
        total_documents=total_docs,
        total_size_bytes=total_size_bytes,
        total_chats=total_chats,
        total_messages=total_messages,
        document_types_distribution=dict(distribution),
        chat_timeline=chat_timeline
    )
