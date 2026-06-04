from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from backend.app.database.models import Document, DocumentChunk

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_product = sum(a * b for a, b in zip(v1, v2))
    norm_a = sum(a * a for a in v1) ** 0.5
    norm_b = sum(b * b for b in v2) ** 0.5
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot_product / (norm_a * norm_b)


def query_similar_chunks(
    db: Session,
    user_id: int,
    query_embedding: List[float],
    document_ids: Optional[List[int]] = None,
    top_k: int = 5
) -> List[Tuple[DocumentChunk, float]]:
    # Get all completed chunks for the user
    query = db.query(DocumentChunk).join(Document)
    query = query.filter(Document.user_id == user_id, Document.status == "completed")
    
    if document_ids:
        query = query.filter(Document.id.in_(document_ids))
        
    chunks = query.all()
    
    scored_chunks = []
    for chunk in chunks:
        if not chunk.embedding:
            continue
        # chunk.embedding is stored as a JSON array of floats in SQLAlchemy JSON field
        # JSON type is auto-deserialized to list[float]
        try:
            score = cosine_similarity(query_embedding, chunk.embedding)
            scored_chunks.append((chunk, score))
        except Exception:
            continue
            
    # Sort by similarity score descending
    scored_chunks.sort(key=lambda x: x[1], reverse=True)
    
    return scored_chunks[:top_k]
