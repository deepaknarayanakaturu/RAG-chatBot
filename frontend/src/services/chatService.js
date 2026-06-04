const API_URL = '/api/chat';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const chatService = {
  async getSessions() {
    const res = await fetch(`${API_URL}/sessions`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load chat sessions');
    return await res.json();
  },

  async createSession(title = 'New Chat') {
    const res = await fetch(`${API_URL}/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create session');
    return await res.json();
  },

  async deleteSession(sessionId) {
    const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete session');
    return await res.json();
  },

  async getMessages(sessionId) {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/messages`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load messages');
    return await res.json();
  },

  async sendMessage(sessionId, content, documentIds = null) {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/query`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ content, title: '', document_ids: documentIds }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return await res.json();
  }
};
