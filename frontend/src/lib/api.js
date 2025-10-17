import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  register: (email, password) => api.post('/api/auth/register', { email, password }),
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
  updateOnboarding: (data) => api.post('/api/auth/onboarding', data),
};

export const submissionsAPI = {
  submitProfiles: (profile_urls) => api.post('/api/submissions/profiles', { profile_urls }),
  getMySubmissions: () => api.get('/api/submissions/my-submissions'),
  getSubmission: (id) => api.get(`/api/submissions/${id}`),
};

export const analysisAPI = {
  getAnalysis: (submission_id) => api.get(`/api/analysis/${submission_id}`),
  downloadAnalysis: (analysis_id) => api.get(`/api/analysis/${analysis_id}/download`),
};

export const contentAPI = {
  submitContent: (raw_content) => api.post('/api/content/submit', { raw_content }),
  getMyIdeas: () => api.get('/api/content/my-ideas'),
  getTweets: (idea_id) => api.get(`/api/content/${idea_id}/tweets`),
  submitFeedback: (tweet_id, feedback_type, feedback_notes) => 
    api.post(`/api/content/tweets/${tweet_id}/feedback`, { feedback_type, feedback_notes }),
};

export const adminAPI = {
  getUsers: () => api.get('/api/admin/users'),
  getUserDetails: (user_id) => api.get(`/api/admin/users/${user_id}`),
  createAnalysis: (data) => api.post('/api/admin/analysis/create', data),
  uploadDocument: (submission_id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/admin/analysis/upload-document?submission_id=${submission_id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getContentIdeas: () => api.get('/api/admin/content-ideas'),
  createTweet: (data) => api.post('/api/admin/tweets/create', data),
  updateTweet: (tweet_id, data) => api.put(`/api/admin/tweets/${tweet_id}`, data),
  deleteTweet: (tweet_id) => api.delete(`/api/admin/tweets/${tweet_id}`),
  getPrompts: (category) => api.get('/api/admin/prompts', { params: { category } }),
  createPrompt: (data) => api.post('/api/admin/prompts', data),
  updatePrompt: (prompt_id, data) => api.put(`/api/admin/prompts/${prompt_id}`, data),
  deletePrompt: (prompt_id) => api.delete(`/api/admin/prompts/${prompt_id}`),
};


