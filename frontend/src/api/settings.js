import client from './client';

export const settingsApi = {
  getSettings() {
    return client.get('/settings');
  },
  updateSettings(payload) {
    return client.put('/settings', payload);
  },
  loadResources() {
    return client.post('/settings/load');
  },
  getDashboard() {
    return client.get('/stats/dashboard');
  },
};
