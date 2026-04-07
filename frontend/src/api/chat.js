import client from './client';

export const chatApi = {
  createSession(payload) {
    return client.post('/sessions', payload);
  },
  getSessions() {
    return client.get('/sessions');
  },
  getSessionDetail(id) {
    return client.get(`/sessions/${id}`);
  },
  updateSession(id, payload) {
    return client.put(`/sessions/${id}`, payload);
  },
  deleteSession(id) {
    return client.delete(`/sessions/${id}`);
  },
  sendMessage(payload) {
    return client.post('/chat', payload);
  },
  stopGeneration(sessionId) {
    return client.post(`/chat/stop/${sessionId}`);
  },
};
