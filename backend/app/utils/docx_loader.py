import docx

def load_docx(file_path: str) -> str:
    try:
        doc = docx.Document(file_path)
        text = []
        for paragraph in doc.paragraphs:
            text.append(paragraph.text)
        return "\n".join(text)
    except Exception as e:
        raise RuntimeError(f"Error reading DOCX file: {str(e)}")
