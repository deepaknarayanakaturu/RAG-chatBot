import os
import secrets
from dotenv import load_dotenv

# Load .env file only if it exists (local development)
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    # Also check parent of backend (project root)
    project_env = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env")
    if os.path.exists(project_env):
        load_dotenv(project_env)

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/smart_rag")
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_hex(32))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Server
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS — comma-separated origins, or "*" for dev
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # Upload directories
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

    UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
    PDF_DIR: str = os.path.join(UPLOAD_DIR, "pdfs")
    DOCX_DIR: str = os.path.join(UPLOAD_DIR, "docx")
    TXT_DIR: str = os.path.join(UPLOAD_DIR, "txt")
    
    # API Keys for RAG (optional)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

settings = Settings()

# Ensure directories exist
for path in [settings.UPLOAD_DIR, settings.PDF_DIR, settings.DOCX_DIR, settings.TXT_DIR]:
    os.makedirs(path, exist_ok=True)
