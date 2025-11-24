import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  uploadLogo: (formData) => api.post('/auth/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Event API
export const eventAPI = {
  create: (data) => api.post('/events', data),
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getByAccessCode: (code) => api.get(`/events/access/${code}`),
  toggleDownloads: (id) => api.put(`/events/${id}/downloads`),
  regenerateQR: (id) => api.post(`/events/${id}/qr-code`)
};

// Photo API
export const photoAPI = {
  upload: (eventId, formData) => api.post(`/photos/events/${eventId}/photos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (eventId, params) => api.get(`/photos/events/${eventId}/photos`, { params }),
  getOne: (id) => api.get(`/photos/${id}`),
  download: (id) => `${API_URL}/photos/${id}/download`,
  addWatermark: (id) => api.post(`/photos/${id}/watermark`),
  addWatermarkToAll: (eventId) => api.post(`/photos/events/${eventId}/photos/watermark-all`),
  delete: (id) => api.delete(`/photos/${id}`),
  updateTags: (id, data) => api.put(`/photos/${id}/tags`, data)
};

// Guest API
export const guestAPI = {
  create: (eventId, data) => api.post(`/guests/events/${eventId}/guests`, data),
  bulkCreate: (eventId, data) => api.post(`/guests/events/${eventId}/guests/bulk`, data),
  getAll: (eventId, params) => api.get(`/guests/events/${eventId}/guests`, { params }),
  getOne: (id) => api.get(`/guests/${id}`),
  update: (id, data) => api.put(`/guests/${id}`, data),
  delete: (id) => api.delete(`/guests/${id}`),
  getPhotos: (id) => api.get(`/guests/${id}/photos`)
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getEventAnalytics: (eventId, params) => api.get(`/analytics/events/${eventId}`, { params }),
  getPhotoAnalytics: (id) => api.get(`/analytics/photos/${id}`)
};

export default api;
