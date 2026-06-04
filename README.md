# Smart RAG Assistant & Dashboard

A premium, production-grade Retrieval-Augmented Generation (RAG) assistant that allows users to upload documents (PDF, DOCX, TXT), index them semantically using cosine similarity matching, and chat with them in real-time. Features a visually stunning, responsive operations dashboard.

## Technology Stack

- **Backend**: FastAPI (Python 3.13), SQLAlchemy, PostgreSQL
- **RAG Pipeline**: Cosine similarity vector search, text chunking, pypdf text extraction, python-docx parser
- **Frontend Source**: React (Vite), Tailwind CSS, Chart.js, Lucide Icons
- **Direct App Dashboard**: Single-Page App served directly by FastAPI static assets (requires zero Node.js setups!)

---

## Folder Structure

```text
smart-rag-assistant/
│
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (auth, documents, chat, dashboard)
│   │   ├── auth/         # JWT handler and bcrypt security functions
│   │   ├── config/       # Pydantic environment configurations
│   │   ├── database/     # DB connection session and models definitions
│   │   ├── rag/          # Cosine similarity matching, text splitters, embedding builders
│   │   ├── schemas/      # JSON request/response validation schemas
│   │   ├── services/     # Core services (document processing, RAG orchestration, analytics)
│   │   ├── static/       # Direct-run single page application (index.html)
│   │   ├── utils/        # Extractor helpers (PDF, DOCX, TXT parsers)
│   │   └── main.py       # FastAPI application entrypoint
│   └── uploads/          # Saved physical document assets
│
└── frontend/
    ├── src/              # React components, routing context, pages, services
    ├── package.json      # React node packages
    ├── vite.config.js    # Vite compilation configs
    └── index.html        # React development page
```

---

## Quick Start (No Node.js Required)

Since Node.js is not on the system PATH, you can run the entire application (including the visual dashboard and RAG chatbot) directly using Python.

### 1. Start the FastAPI Server
Open a terminal in the project root directory and execute:
```powershell
.\venv\Scripts\uvicorn.exe app.main:app --reload
```

### 2. Open the Application
Launch your browser and navigate to:
```text
http://127.0.0.1:8000/
```
From here you can:
- Register a new account and log in.
- Upload documents (PDF, Word, TXT) and view parsing progress status.
- View database storage consumption and document distribution metrics.
- Create chat threads and ask questions about your indexed documents.

### 3. Open API Documentation (Swagger)
To view and test the backend endpoints, open:
```text
http://127.0.0.1:8000/docs
```

---

## React Frontend Development (Optional)

If you install Node.js later and want to run the React/Vite development server:

1. Open a new terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Open the development client at `http://localhost:3000`. API calls will be proxied to the backend on port 8000.
