const API_URL = '/api/dashboard';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const dashboardService = {
  async getStats() {
    const res = await fetch(`${API_URL}/stats`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return await res.json();
  }
};
