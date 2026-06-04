def split_text(text: str, chunk_size: int = 800, chunk_overlap: int = 150) -> list[str]:
    if not text:
        return []
    
    # Standardize spacing
    text = "\n".join([line.strip() for line in text.split("\n") if line.strip()])
    
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        if not para.strip():
            continue
        
        # If adding this paragraph exceeds chunk_size, we finalize the current chunk
        if len(current_chunk) + len(para) + 2 <= chunk_size:
            if current_chunk:
                current_chunk += "\n\n" + para
            else:
                current_chunk = para
        else:
            if current_chunk:
                chunks.append(current_chunk)
                
            # If paragraph itself is too large, split by sentences
            if len(para) > chunk_size:
                sentences = para.replace(". ", ".\n").split("\n")
                current_chunk = ""
                for sent in sentences:
                    if not sent.strip():
                        continue
                    if len(current_chunk) + len(sent) + 1 <= chunk_size:
                        if current_chunk:
                            current_chunk += " " + sent
                        else:
                            current_chunk = sent
                    else:
                        if current_chunk:
                            chunks.append(current_chunk)
                        current_chunk = sent
                
                if current_chunk:
                    # If sentence is STILL too large, force slice it
                    if len(current_chunk) > chunk_size:
                        for idx in range(0, len(current_chunk), chunk_size - chunk_overlap):
                            chunks.append(current_chunk[idx:idx + chunk_size])
                        current_chunk = ""
            else:
                # Add overlap from last chunk if any
                overlap_text = ""
                if chunks:
                    last_chunk = chunks[-1]
                    overlap_text = last_chunk[-chunk_overlap:] if len(last_chunk) > chunk_overlap else last_chunk
                
                current_chunk = (overlap_text + "\n\n" if overlap_text else "") + para

    if current_chunk:
        chunks.append(current_chunk)
        
    return [c.strip() for c in chunks if c.strip()]
