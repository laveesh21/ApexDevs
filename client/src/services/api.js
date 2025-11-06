const API_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  getMe: async (token) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  updateProfile: async (token, profileData) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  changePassword: async (token, passwordData) => {
    const response = await fetch(`${API_URL}/auth/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
    return handleResponse(response);
  },

  uploadAvatar: async (token, file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/auth/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },
};

// Project API
export const projectAPI = {
  create: async (token, projectData) => {
    const formData = new FormData();
    
    formData.append('title', projectData.title);
    formData.append('description', projectData.description);
    formData.append('category', projectData.category);
    formData.append('status', projectData.status);
    formData.append('technologies', JSON.stringify(projectData.technologies));
    
    if (projectData.demoUrl) formData.append('demoUrl', projectData.demoUrl);
    if (projectData.githubUrl) formData.append('githubUrl', projectData.githubUrl);
    
    if (projectData.thumbnail) formData.append('thumbnail', projectData.thumbnail);
    if (projectData.images) {
      projectData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/projects?${queryString}`);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`);
    return handleResponse(response);
  },

  update: async (token, id, projectData) => {
    const formData = new FormData();
    
    if (projectData.title) formData.append('title', projectData.title);
    if (projectData.description) formData.append('description', projectData.description);
    if (projectData.category) formData.append('category', projectData.category);
    if (projectData.status) formData.append('status', projectData.status);
    if (projectData.technologies) formData.append('technologies', JSON.stringify(projectData.technologies));
    if (projectData.demoUrl !== undefined) formData.append('demoUrl', projectData.demoUrl);
    if (projectData.githubUrl !== undefined) formData.append('githubUrl', projectData.githubUrl);
    
    if (projectData.thumbnail) formData.append('thumbnail', projectData.thumbnail);
    if (projectData.images) {
      projectData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  delete: async (token, id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  toggleLike: async (token, id) => {
    const response = await fetch(`${API_URL}/projects/${id}/like`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getUserProjects: async (userId) => {
    const response = await fetch(`${API_URL}/projects?author=${userId}`);
    return handleResponse(response);
  }
};

// Local storage helpers
export const storage = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem('user'),
  
  clearAuth: () => {
    storage.removeToken();
    storage.removeUser();
  },
};
