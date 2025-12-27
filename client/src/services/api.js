const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  deleteAvatar: async (token) => {
    const response = await fetch(`${API_URL}/auth/avatar`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  updatePrivacySettings: async (token, privacyData) => {
    const response = await fetch(`${API_URL}/auth/privacy`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(privacyData),
    });
    return handleResponse(response);
  },

  blockUser: async (token, userId) => {
    const response = await fetch(`${API_URL}/auth/users/${userId}/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  unblockUser: async (token, userId) => {
    const response = await fetch(`${API_URL}/auth/users/${userId}/block`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getBlockedUsers: async (token) => {
    const response = await fetch(`${API_URL}/auth/blocked`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  followUser: async (token, userId) => {
    const response = await fetch(`${API_URL}/auth/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  unfollowUser: async (token, userId) => {
    const response = await fetch(`${API_URL}/auth/users/${userId}/follow`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getUserProfile: async (userId, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/auth/users/${userId}`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response);
  },

  getUserFollowers: async (userId) => {
    const response = await fetch(`${API_URL}/auth/users/${userId}/followers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  getUserFollowing: async (userId) => {
    const response = await fetch(`${API_URL}/auth/users/${userId}/following`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    formData.append('briefDescription', projectData.briefDescription);
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

  getById: async (id, token = null) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers
    });
    return handleResponse(response);
  },

  update: async (token, id, projectData) => {
    // Check if projectData is already a FormData object
    let formData;
    
    if (projectData instanceof FormData) {
      formData = projectData;
    } else {
      formData = new FormData();
      
      if (projectData.title) formData.append('title', projectData.title);
      if (projectData.description) formData.append('description', projectData.description);
      if (projectData.briefDescription) formData.append('briefDescription', projectData.briefDescription);
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
  },

  // Review methods
  addReview: async (token, projectId, reviewData) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  getReviews: async (projectId, token = null, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/projects/${projectId}/reviews?${queryString}`, {
      headers
    });
    return handleResponse(response);
  },

  deleteReview: async (token, projectId) => {
    const response = await fetch(`${API_URL}/projects/${projectId}/review`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  }
};

// Thread API
export const threadAPI = {
  create: async (token, threadData) => {
    const response = await fetch(`${API_URL}/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(threadData),
    });
    return handleResponse(response);
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/threads?${queryString}`);
    return handleResponse(response);
  },

  getById: async (id, token = null) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/threads/${id}`, {
      headers
    });
    return handleResponse(response);
  },

  update: async (token, id, threadData) => {
    const response = await fetch(`${API_URL}/threads/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(threadData),
    });
    return handleResponse(response);
  },

  delete: async (token, id) => {
    const response = await fetch(`${API_URL}/threads/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  toggleLike: async (token, id) => {
    const response = await fetch(`${API_URL}/threads/${id}/like`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  vote: async (token, id, voteType) => {
    const response = await fetch(`${API_URL}/threads/${id}/vote`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ voteType }),
    });
    return handleResponse(response);
  },

  // Comment methods
  addComment: async (token, threadId, commentData) => {
    const response = await fetch(`${API_URL}/threads/${threadId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(commentData),
    });
    return handleResponse(response);
  },

  getComments: async (threadId, token = null, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/threads/${threadId}/comments?${queryString}`, {
      headers
    });
    return handleResponse(response);
  },

  updateComment: async (token, commentId, content) => {
    const response = await fetch(`${API_URL}/threads/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  deleteComment: async (token, commentId) => {
    const response = await fetch(`${API_URL}/threads/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  toggleCommentLike: async (token, commentId) => {
    const response = await fetch(`${API_URL}/threads/comments/${commentId}/like`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  voteComment: async (token, commentId, voteType) => {
    const response = await fetch(`${API_URL}/threads/comments/${commentId}/vote`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ voteType }),
    });
    return handleResponse(response);
  },

  getUserThreads: async (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/threads/user/${userId}?${queryString}`);
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

// Chat API
export const chatAPI = {
  // Get all conversations
  getConversations: async (token) => {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Get or create conversation with a user
  getOrCreateConversation: async (token, userId) => {
    const response = await fetch(`${API_URL}/chat/conversation/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Get messages in a conversation
  getMessages: async (token, conversationId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/chat/conversation/${conversationId}/messages?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Send a message
  sendMessage: async (token, conversationId, content) => {
    const response = await fetch(`${API_URL}/chat/conversation/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    return handleResponse(response);
  },

  // Mark conversation as read
  markAsRead: async (token, conversationId) => {
    const response = await fetch(`${API_URL}/chat/conversation/${conversationId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Delete conversation
  deleteConversation: async (token, conversationId) => {
    const response = await fetch(`${API_URL}/chat/conversation/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

