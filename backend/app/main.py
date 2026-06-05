import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config.settings import settings
from app.database.db import engine, Base
from app.api import auth, documents, chat, dashboard

# 1. Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart RAG Assistant",
    description="A powerful RAG system with document uploading and interactive analytics dashboard.",
    version="1.0.0"
)

# 2. Configure CORS middleware
origins = settings.CORS_ORIGINS
allow_credentials = True

# Browsers reject credentials with wildcard origin, so disable credentials for wildcard
if origins == ["*"]:
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Register api routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(dashboard.router)

# 4. Set up Static Files serving for the compiled or direct SPA
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)

# Mount files inside static at /assets path
if os.path.isdir(static_dir):
    app.mount("/assets", StaticFiles(directory=static_dir), name="assets")

@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    # Ignore API routes - they should fail naturally or get caught before this
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
        
    index_file = os.path.join(static_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
        
    return {
        "status": "online",
        "message": "Smart RAG API is running. Go to /docs for Swagger documentation. Set up frontend/static/index.html to view UI."
    }
