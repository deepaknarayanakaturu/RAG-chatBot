from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.database.models import ChatSession, ChatMessage
from app.rag.retriever import retrieve_context
from app.rag.qa_chain import generate_answer_from_context
from app.schemas.chat import ChatQueryResponse, SourceNode

def get_or_create_session(db: Session, user_id: int, session_id: Optional[int] = None, title: str = "New Chat") -> ChatSession:
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
        if session:
            return session
            
    # Create new session if not specified or not found
    new_session = ChatSession(user_id=user_id, title=title)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


def run_chat_query(
    db: Session,
    user_id: int,
    session_id: int,
    query_text: str,
    document_ids: Optional[List[int]] = None
) -> ChatQueryResponse:
    # 1. Fetch chat session
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
    if not session:
        raise ValueError("Chat session not found.")

    # Update session title if default
    if session.title == "New Chat" and len(query_text) > 5:
        session.title = query_text[:30] + ("..." if len(query_text) > 30 else "")
        db.commit()

    # 2. Save User Message
    user_msg = ChatMessage(session_id=session.id, role="user", content=query_text)
    db.add(user_msg)
    db.commit()

    # 3. Retrieve Context Chunks
    scored_chunks = retrieve_context(db, user_id, query_text, document_ids=document_ids, top_k=4)

    # 4. Generate Answer
    answer = generate_answer_from_context(query_text, scored_chunks)

    # 5. Save Assistant Message
    assistant_msg = ChatMessage(session_id=session.id, role="assistant", content=answer)
    db.add(assistant_msg)
    db.commit()

    # 6. Format Sources for Response
    sources = []
    for chunk, score in scored_chunks:
        sources.append(
            SourceNode(
                document_name=chunk.document.filename,
                document_id=chunk.document_id,
                chunk_index=chunk.chunk_index,
                content=chunk.content,
                score=float(score)
            )
        )

    return ChatQueryResponse(
        answer=answer,
        session_id=session.id,
        sources=sources
    )
