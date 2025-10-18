import axios from 'axios';

const API_URL = 'https://venkat-security.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const changeAdminPassword = async (currentPassword, newPassword) => {
  const response = await api.post('/auth/change-password', {
    currentPassword,
    newPassword
  });
  return response.data;
};

export const updateAdminProfile = async (username) => {
  const response = await api.put('/auth/profile', { username });
  return response.data;
};

// Password APIs
export const verifyOldPassword = async (oldPassword) => {
  const response = await api.post('/password/verify-old-password', { oldPassword });
  return response.data;
};

export const changeUnlockPassword = async (oldPassword, newPassword) => {
  const response = await api.post('/password/change-unlock-password', { oldPassword, newPassword });
  return response.data;
};

export const getCurrentUnlockPassword = async () => {
  const response = await api.get('/password/current-unlock-password');
  return response.data;
};

export const getPasswordHistory = async () => {
  const response = await api.get('/password/password-history');
  return response.data;
};

export const revealCurrentPassword = async (adminPassword) => {
  const response = await api.post('/password/reveal-current-password', { adminPassword });
  return response.data;
};

// Logs APIs
export const getLogs = async (limit = 100, skip = 0) => {
  const response = await api.get(`/logs?limit=${limit}&skip=${skip}`);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/logs/stats');
  return response.data;
};

export const clearLogs = async () => {
  const response = await api.delete('/logs/clear', {
    data: { confirm: 'DELETE_ALL_LOGS' }
  });
  return response.data;
};

// Notifications APIs
export const getNotifications = async (limit = 50, skip = 0, unreadOnly = false) => {
  const response = await api.get(`/notifications?limit=${limit}&skip=${skip}&unreadOnly=${unreadOnly}`);
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationsRead = async (notificationIds) => {
  const response = await api.post('/notifications/mark-read', { notificationIds });
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.post('/notifications/mark-all-read');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const clearAllNotifications = async () => {
  const response = await api.delete('/notifications/clear/all');
  return response.data;
};

// Settings APIs
export const getSMTPSettings = async () => {
  const response = await api.get('/settings/smtp');
  return response.data;
};

export const saveSMTPSettings = async (settings) => {
  const response = await api.post('/settings/smtp', settings);
  return response.data;
};

export const testSMTPSettings = async (settings) => {
  const response = await api.post('/settings/smtp/test', settings);
  return response.data;
};

// TOTP APIs
export const setupTOTP = async (unlockPassword) => {
  const response = await api.post('/totp/setup', { unlockPassword });
  return response.data;
};

export const getCurrentTOTP = async () => {
  const response = await api.get('/totp/current');
  return response.data;
};

export const getTOTPStatus = async () => {
  const response = await api.get('/totp/status');
  return response.data;
};

export const disableTOTP = async (unlockPassword) => {
  const response = await api.post('/totp/disable', { unlockPassword });
  return response.data;
};

export default api;

