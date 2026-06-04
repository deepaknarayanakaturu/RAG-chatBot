const API_URL = '/api/documents';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const documentService = {
  async getDocuments() {
    const res = await fetch(API_URL, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load documents');
    return await res.json();
  },

  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
  },

  async deleteDocument(documentId) {
    const res = await fetch(`${API_URL}/${documentId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return await res.json();
  },

  getDownloadUrl(documentId) {
    const token = localStorage.getItem('token');
    return `${API_URL}/${documentId}/download?token=${token}`; // Token can be passed as query param if route supports it, or use standard fetch
  }
};
