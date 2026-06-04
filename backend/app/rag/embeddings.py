import os
import httpx
from typing import List
from app.config.settings import settings

# Attempt to import sentence-transformers for local semantic search
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

# Fallback: HashingVectorizer from scikit-learn generates fixed-size similarity vectors
try:
    from sklearn.feature_extraction.text import HashingVectorizer
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class EmbeddingsGenerator:
    def __init__(self):
        self.model = None
        if SENTENCE_TRANSFORMERS_AVAILABLE:
            try:
                # Load a lightweight, popular semantic model
                self.model = SentenceTransformer("all-MiniLM-L6-v2")
            except Exception:
                self.model = None
        
        if not self.model and SKLEARN_AVAILABLE:
            # Hash to 384 dimensions to match all-MiniLM-L6-v2 output size
            self.vectorizer = HashingVectorizer(n_features=384, alternate_sign=False)
            
    def get_embedding(self, text: str) -> List[float]:
        # 1. Try Gemini API
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}"
                headers = {"Content-Type": "application/json"}
                payload = {
                    "model": "models/text-embedding-004",
                    "content": {"parts": [{"text": text}]}
                }
                res = httpx.post(url, json=payload, headers=headers, timeout=10.0)
                if res.status_code == 200:
                    return res.json()["embedding"]["values"]
            except Exception:
                pass  # Fallback to next method
                
        # 2. Try OpenAI API
        if settings.OPENAI_API_KEY:
            try:
                url = "https://api.openai.com/v1/embeddings"
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}"
                }
                payload = {
                    "input": text,
                    "model": "text-embedding-3-small"
                }
                res = httpx.post(url, json=payload, headers=headers, timeout=10.0)
                if res.status_code == 200:
                    return res.json()["data"][0]["embedding"]
            except Exception:
                pass  # Fallback to next method

        # 3. Try local SentenceTransformers
        if self.model:
            try:
                embedding = self.model.encode(text)
                return embedding.tolist()
            except Exception:
                pass

        # 4. Fallback: Hashing Vectorizer
        if SKLEARN_AVAILABLE:
            # Transform text into sparse matrix, convert to dense array and pull first row
            sparse_vector = self.vectorizer.transform([text])
            dense_vector = sparse_vector.toarray()[0]
            # Normalize to unit length
            norm = sum(x*x for x in dense_vector) ** 0.5
            if norm > 0:
                dense_vector = [x / norm for x in dense_vector]
            return list(dense_vector)
        
        # 5. Last resort dummy embedding
        return [0.1] * 384

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        return [self.get_embedding(t) for t in texts]

embeddings_generator = EmbeddingsGenerator()
