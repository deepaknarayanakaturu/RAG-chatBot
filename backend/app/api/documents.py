import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.db import get_db
from backend.app.database.models import User, Document
from backend.app.schemas.document import DocumentResponse
from backend.app.api.auth import get_current_user
from backend.app.services.document_service import process_document, delete_document

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file extension. Only PDF, DOCX, and TXT are supported."
        )

    # Save UploadFile to a temporary file
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            shutil_path = temp_file.name
            # Write contents in chunks
            while content := file.file.read(1024 * 1024):
                temp_file.write(content)
        
        # Process the document
        db_doc = process_document(db, file.filename, shutil_path, current_user.id)
        return db_doc
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during file processing: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if 'shutil_path' in locals() and os.path.exists(shutil_path):
            try:
                os.remove(shutil_path)
            except Exception:
                pass


@router.get("", response_model=List[DocumentResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.upload_date.desc()).all()


@router.delete("/{document_id}", status_code=status.HTTP_200_OK)
def delete_file(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = delete_document(db, document_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied."
        )
    return {"message": "Document deleted successfully"}


@router.get("/{document_id}/download")
def download_file(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    if not db_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied."
        )
        
    if not os.path.exists(db_doc.filepath):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Physical file not found on server."
        )
        
    return FileResponse(
        path=db_doc.filepath,
        filename=db_doc.filename,
        media_type="application/octet-stream"
    )
