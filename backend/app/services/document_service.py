import os
import shutil
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.database.models import Document, DocumentChunk
from app.utils.pdf_loader import load_pdf
from app.utils.docx_loader import load_docx
from app.utils.txt_loader import load_txt
from app.rag.chunking import split_text
from app.rag.embeddings import embeddings_generator

def process_document(db: Session, filename: str, temp_file_path: str, user_id: int) -> Document:
    # 1. Determine extension and upload destination
    ext = os.path.splitext(filename)[1].lower()
    
    if ext == ".pdf":
        target_dir = settings.PDF_DIR
        loader = load_pdf
        file_type = "pdf"
    elif ext in [".docx", ".doc"]:
        target_dir = settings.DOCX_DIR
        loader = load_docx
        file_type = "docx"
    elif ext == ".txt":
        target_dir = settings.TXT_DIR
        loader = load_txt
        file_type = "txt"
    else:
        raise ValueError("Unsupported file format. Please upload PDF, DOCX, or TXT.")

    target_filepath = os.path.join(target_dir, filename)
    
    # 2. Check if filename exists, make unique if needed
    base, extension = os.path.splitext(filename)
    counter = 1
    while os.path.exists(target_filepath):
        filename = f"{base}_{counter}{extension}"
        target_filepath = os.path.join(target_dir, filename)
        counter += 1

    # 3. Copy to destination
    shutil.copy(temp_file_path, target_filepath)
    file_size = os.path.getsize(target_filepath)

    # 4. Store RELATIVE path from BASE_DIR (cross-platform, survives deploys)
    relative_path = os.path.relpath(target_filepath, settings.BASE_DIR)

    # 5. Create document row in database as processing
    db_doc = Document(
        filename=filename,
        filepath=relative_path,
        file_type=file_type,
        file_size=file_size,
        user_id=user_id,
        status="processing",
        chunk_count=0
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    try:
        # 6. Extract text
        text = loader(target_filepath)
        if not text.strip():
            raise ValueError("No text content could be extracted from the file.")

        # 7. Chunk text
        chunks = split_text(text)
        if not chunks:
            raise ValueError("Text content was too short or failed to chunk.")

        # 8. Generate embeddings and save chunks
        db_doc.chunk_count = len(chunks)
        db.commit()

        for idx, chunk_text in enumerate(chunks):
            vector = embeddings_generator.get_embedding(chunk_text)
            db_chunk = DocumentChunk(
                document_id=db_doc.id,
                chunk_index=idx,
                content=chunk_text,
                embedding=vector
            )
            db.add(db_chunk)
        
        # 9. Complete process
        db_doc.status = "completed"
        db.commit()
        db.refresh(db_doc)
        
    except Exception as e:
        db_doc.status = "failed"
        db.commit()
        # Clean up file on failure
        if os.path.exists(target_filepath):
            try:
                os.remove(target_filepath)
            except Exception:
                pass
        raise RuntimeError(f"Failed to process document {filename}: {str(e)}")

    return db_doc


def resolve_filepath(relative_path: str) -> str:
    """Resolve a stored relative path to an absolute path."""
    abs_path = os.path.join(settings.BASE_DIR, relative_path)
    return os.path.normpath(abs_path)


def delete_document(db: Session, document_id: int, user_id: int) -> bool:
    db_doc = db.query(Document).filter(Document.id == document_id, Document.user_id == user_id).first()
    if not db_doc:
        return False
        
    # Resolve actual file path
    actual_path = resolve_filepath(db_doc.filepath)
    
    # Delete from database (cascade deletes chunks)
    db.delete(db_doc)
    db.commit()
    
    # Delete physical file
    if os.path.exists(actual_path):
        try:
            os.remove(actual_path)
        except Exception:
            pass
            
    return True
