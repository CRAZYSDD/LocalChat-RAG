import client from './client';

export const authApi = {
  login(payload) {
    return client.post('/auth/login', payload);
  },
};
