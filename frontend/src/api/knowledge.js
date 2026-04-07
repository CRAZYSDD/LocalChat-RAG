import client from './client';

export const knowledgeApi = {
  upload(formData) {
    return client.post('/knowledge/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFiles() {
    return client.get('/knowledge/files');
  },
  deleteFile(id) {
    return client.delete(`/knowledge/files/${id}`);
  },
  reindex() {
    return client.post('/knowledge/reindex');
  },
  query(payload) {
    return client.post('/rag/query', payload);
  },
};
