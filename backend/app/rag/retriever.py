from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from backend.app.rag.embeddings import embeddings_generator
from backend.app.rag.vector_store import query_similar_chunks
from backend.app.database.models import DocumentChunk

def retrieve_context(
    db: Session,
    user_id: int,
    query: str,
    document_ids: Optional[List[int]] = None,
    top_k: int = 5
) -> List[Tuple[DocumentChunk, float]]:
    # Generate query embedding vector
    query_embedding = embeddings_generator.get_embedding(query)
    
    # Query database and find best chunks
    return query_similar_chunks(db, user_id, query_embedding, document_ids, top_k)
