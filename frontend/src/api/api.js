import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Normalize errors so components can just use err.message
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  }
);

const api = {
  auth: {
    register: (data) => instance.post('/api/auth/register', data).then((r) => r.data),
    login: (data) => instance.post('/api/auth/login', data).then((r) => r.data),
    logout: () => instance.post('/api/auth/logout').then((r) => r.data),
    me: () => instance.get('/api/auth/me').then((r) => r.data),
  },
  tasks: {
    getAll: (status) =>
      instance.get(`/api/task/display${status ? `?status=${status}` : ''}`).then((r) => r.data),
    create: (data) => instance.post('/api/task/create', data).then((r) => r.data),
    update: (id, data) => instance.put(`/api/task/update/${id}`, data).then((r) => r.data),
    delete: (id) => instance.delete(`/api/task/delete/${id}`).then((r) => r.data),
    updateTimeElapsed: (data) => instance.put('/api/task/update-time', data).then((r) => r.data),
    addCycle: (data) => instance.put('/api/task/addCycle', data).then((r) => r.data),
  },
  stats: {
    get: () => instance.get('/api/stats').then((r) => r.data),
    update: (data) => instance.post('/api/stats/update', data).then((r) => r.data),
  },
};

export default api;
