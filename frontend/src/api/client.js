import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 120000
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.detail || error.message || '请求失败';
    return Promise.reject(new Error(message));
  },
);

export default client;
