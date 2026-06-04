import httpx
from typing import List, Tuple
from app.config.settings import settings
from app.database.models import DocumentChunk

def generate_answer_from_context(
    query: str,
    context_chunks: List[Tuple[DocumentChunk, float]]
) -> str:
    # 1. Try Gemini API
    if settings.GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            
            # Format context
            context_text = "\n\n".join([f"Source [{chunk.document.filename}]: {chunk.content}" for chunk, _ in context_chunks])
            
            prompt = f"""You are a helpful AI assistant. Answer the user's question using ONLY the provided document context. If the answer cannot be found in the context, say that the context does not contain enough information. Do not invent details. Provide citations where possible.

Context:
{context_text}

Question: {query}
Answer:"""
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            res = httpx.post(url, json=payload, headers=headers, timeout=20.0)
            if res.status_code == 200:
                res_json = res.json()
                return res_json["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            pass  # Fallback to next method

    # 2. Try OpenAI API
    if settings.OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}"
            }
            context_text = "\n\n".join([f"Source [{chunk.document.filename}]: {chunk.content}" for chunk, _ in context_chunks])
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a helpful assistant. Answer the user's question using only the provided context. If you cannot find the answer, state that there is not enough information in the context. Keep answers concise."},
                    {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {query}"}
                ]
            }
            res = httpx.post(url, json=payload, headers=headers, timeout=20.0)
            if res.status_code == 200:
                res_json = res.json()
                return res_json["choices"][0]["message"]["content"]
        except Exception:
            pass  # Fallback to local answering

    # 3. Local Smart Fallback (Deterministic extractive QA)
    q_lower = query.lower()
    
    # Handle greetings
    greetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon"]
    if any(g in q_lower for g in greetings) and len(q_lower.split()) < 4:
        return "Hello! I am your RAG Assistant. I can help you search and answer questions based on the documents you upload. Ask me anything!"
        
    if not context_chunks:
        return "I don't have any document contexts to search. Please upload a PDF, DOCX, or TXT file first."

    # Parse query into keywords (exclude small common words)
    stop_words = {"what", "where", "which", "whose", "there", "their", "about", "would", "could", "should", "shall", "under", "above", "after", "before", "while", "these", "those"}
    words = [w.strip("?.!,:;") for w in q_lower.split() if len(w) > 3 and w not in stop_words]
    
    matched_sentences = []
    for chunk, score in context_chunks:
        # Split chunk into sentences
        sentences = chunk.content.replace("\r", "").replace("\n", " ").split(". ")
        for sentence in sentences:
            sentence_stripped = sentence.strip()
            if not sentence_stripped:
                continue
            
            # Count word matches
            matches = sum(1 for w in words if w in sentence_stripped.lower())
            if matches > 0:
                matched_sentences.append((sentence_stripped, matches, chunk.document.filename))
                
    # Sort matched sentences by keyword hits descending
    matched_sentences.sort(key=lambda x: x[1], reverse=True)
    
    if matched_sentences:
        output_parts = [
            f"Based on the most relevant match found in **{matched_sentences[0][2]}**:"
        ]
        
        seen_sentences = set()
        added_count = 0
        for sent, _, doc in matched_sentences:
            normalized_sent = sent.lower()
            if normalized_sent not in seen_sentences and added_count < 3:
                output_parts.append(f"> \"{sent}.\"")
                seen_sentences.add(normalized_sent)
                added_count += 1
                
        output_parts.append("\nFeel free to upload more documents to enrich the results, or refine your query with more specific terms.")
        return "\n\n".join(output_parts)
        
    # If no word matches, show the top text passage
    top_chunk, score = context_chunks[0]
    return (
        f"I searched your documents but couldn't find a direct keyword sentence match. "
        f"The most mathematically similar section from **{top_chunk.document.filename}** (similarity: {score:.2f}) is:\n\n"
        f"> \"{top_chunk.content[:450]}...\"\n\n"
        f"Please try rephrasing your question or check if the target information exists in the uploaded files."
    )
