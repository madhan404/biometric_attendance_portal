const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3001/api';

// Get auth headers from session storage
const getAuthHeaders = () => {
  const headers = sessionStorage.getItem("authHeaders");
  if (headers) {
    return JSON.parse(headers);
  }
  return {
    'Content-Type': 'application/json'
  };
};

// Make an authenticated API request
export const apiRequest = async (endpoint, options = {}) => {
  const headers = getAuthHeaders();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = '/';
    throw new Error('Session expired. Please login again.');
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// Common API methods
export const api = {
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'GET' }),
    
  post: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(body)
    }),
    
  put: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { ...options, method: 'DELETE' }),
    
  patch: (endpoint, body, options = {}) => 
    apiRequest(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: JSON.stringify(body)
    })
}; 