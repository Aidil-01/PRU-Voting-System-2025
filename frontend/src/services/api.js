import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'Server error';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Voters API
export const votersAPI = {
  // Get all voters with pagination and search
  getAll: (params = {}) => api.get('/voters', { params }),
  
  // Get voter by ID
  getById: (id) => api.get(`/voters/${id}`),
  
  // Add new voter
  add: (voterData) => api.post('/voters', voterData),
  
  // Update voter
  update: (id, voterData) => api.put(`/voters/${id}`, voterData),
  
  // Delete voter
  delete: (id) => api.delete(`/voters/${id}`),
  
  // Cast vote
  vote: (voteData) => api.post('/voters/vote', voteData),
  
  // Get voting statistics
  getStats: () => api.get('/voters/stats'),
};

// Villages API
export const villagesAPI = {
  // Get all villages
  getAll: () => api.get('/villages'),
  
  // Add new village
  add: (villageData) => api.post('/villages', villageData),
  
  // Get village by ID
  getById: (id) => api.get(`/villages/${id}`),
  
  // Update village
  update: (id, villageData) => api.put(`/villages/${id}`, villageData),
  
  // Delete village
  delete: (id) => api.delete(`/villages/${id}`),
};

// Parties API
export const partiesAPI = {
  // Get all parties
  getAll: () => api.get('/parties'),
  
  // Add new party (with optional logo upload)
  add: (partyData) => {
    const formData = new FormData();
    Object.keys(partyData).forEach(key => {
      if (partyData[key] !== null && partyData[key] !== undefined) {
        formData.append(key, partyData[key]);
      }
    });
    return api.post('/parties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Get party by ID
  getById: (id) => api.get(`/parties/${id}`),
  
  // Update party (with optional logo upload)
  update: (id, partyData) => {
    const formData = new FormData();
    Object.keys(partyData).forEach(key => {
      if (partyData[key] !== null && partyData[key] !== undefined) {
        formData.append(key, partyData[key]);
      }
    });
    return api.put(`/parties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Upload logo for existing party
  uploadLogo: (id, logoFile) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return api.post(`/parties/${id}/upload-logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Delete party
  delete: (id) => api.delete(`/parties/${id}`),
  
  // Get party colors
  getColors: () => api.get('/parties/colors'),
};

// System API
export const systemAPI = {
  // Health check
  health: () => api.get('/health'),
  
  // System info
  info: () => api.get('/info'),
};

export default api;