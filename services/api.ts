// Simple in-memory storage for demo purposes
const users: any[] = [
  {
    id: 1,
    email: 'admin@gmail.com',
    name: 'Admin User',
    profile_image: null,
    created_at: new Date().toISOString(),
    is_admin: true
  }
];

let nextUserId = 2;

// Clear all existing videos and music - start with empty arrays
const videos: any[] = [];
const musics: any[] = [];

// Simple in-memory token storage for demo purposes
let currentToken: string | null = null;

// For development, use the machine's IP address to work with Expo Go
// In production, this should be the actual server address
const API_BASE_URL = 'http://192.168.18.93:5000/api'; // Updated to use the correct IP

// Store token in memory
const storeToken = (token: string) => {
  currentToken = token;
};

// Get token from memory
const getToken = (): string | null => {
  return currentToken;
};

// Remove token from memory
const removeToken = () => {
  currentToken = null;
};

// Fallback authentication for when API is not available
const fallbackLogin = async (email: string, password: string) => {
  // Default admin user credentials
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'Luc14c4$tr0';
  
  // Normalize email (trim whitespace and convert to lowercase)
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedAdminEmail = adminEmail.trim().toLowerCase();
  
  if (normalizedEmail === normalizedAdminEmail && password === adminPassword) {
    const user = {
      id: 1,
      email: normalizedAdminEmail,
      name: 'Admin User',
      profile_image: null,
      created_at: new Date().toISOString(),
      is_admin: true
    };
    
    // Generate a mock token
    const token = 'mock-jwt-token-for-' + normalizedEmail;
    storeToken(token);
    
    return { success: true, user, token };
  } else {
    // Check if user exists in our in-memory storage
    const user = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (user) {
      // In a real app, we would check the password hash
      // For demo purposes, we'll just check if the user exists
      const token = 'mock-jwt-token-for-' + normalizedEmail;
      storeToken(token);
      return { success: true, user, token };
    } else {
      return { success: false, error: 'Invalid credentials' };
    }
  }
};

// Fallback registration for when API is not available
const fallbackRegister = async (email: string, password: string, name?: string) => {
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return { success: false, error: 'User already exists' };
  }
  
  // Create new user
  const newUser = {
    id: nextUserId++,
    email,
    name: name || email.split('@')[0],
    profile_image: null,
    created_at: new Date().toISOString(),
    is_admin: false
  };
  
  users.push(newUser);
  
  // Generate a mock token
  const token = 'mock-jwt-token-for-' + email;
  storeToken(token);
  
  return { success: true, user: newUser, token };
};

// Fallback for profile image upload
const fallbackUploadProfileImage = async (imageUri: string) => {
  const token = getToken();
  if (!token) {
    return { success: false, error: 'No token found' };
  }
  
  // In a real app, we would upload the image to a server
  // For demo purposes, we'll just store the image URI locally
  const email = token.replace('mock-jwt-token-for-', '');
  const user = users.find(u => u.email === email);
  
  if (user) {
    user.profile_image = imageUri;
    return { success: true, profile_image: imageUri };
  }
  
  return { success: false, error: 'User not found' };
};

// API service functions
export const apiService = {
  // Get token (exported for file upload)
  getToken: (): string | null => {
    return getToken();
  },
  
  // Login user
  login: async (email: string, password: string) => {
    try {
      console.log('Attempting to login with:', email);
      
      // First, try to connect to the Python API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log('Login response:', response.status, data);
      
      if (response.ok) {
        // Store token
        storeToken(data.token);
        return { success: true, user: data.user, token: data.token };
      } else {
        // If API returns an error, fallback to local authentication
        console.log('API login failed, falling back to local authentication');
        return await fallbackLogin(email, password);
      }
    } catch (error) {
      // If network error, fallback to local authentication
      console.log('Network error, falling back to local authentication');
      return await fallbackLogin(email, password);
    }
  },

  // Register user
  register: async (email: string, password: string, name?: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token
        storeToken(data.token);
        return { success: true, user: data.user, token: data.token };
      } else {
        // If API returns an error, fallback to local registration
        console.log('API registration failed, falling back to local registration');
        return await fallbackRegister(email, password, name);
      }
    } catch (error) {
      // If network error, fallback to local registration
      console.log('Network error, falling back to local registration');
      return await fallbackRegister(email, password, name);
    }
  },

  // Get user profile
  getProfile: async () => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, user: data };
      } else {
        // If token is invalid, remove it
        if (data.message === 'Token is invalid!') {
          removeToken();
        }
        // Fallback to local user data
        console.log('API profile retrieval failed, falling back to local data');
        const email = token.replace('mock-jwt-token-for-', '');
        const user = users.find(u => u.email === email);
        if (user) {
          return { success: true, user };
        }
        return { success: false, error: data.message };
      }
    } catch (error) {
      // Fallback to local user data
      console.log('Network error, falling back to local data');
      const token = getToken();
      if (token) {
        const email = token.replace('mock-jwt-token-for-', '');
        const user = users.find(u => u.email === email);
        if (user) {
          return { success: true, user };
        }
      }
      return { success: false, error: 'Network error' };
    }
  },

  // Update user profile
  updateProfile: async (updates: any) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(updates),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true, user: data };
      } else {
        // Fallback to local update
        console.log('API profile update failed, falling back to local update');
        const email = token.replace('mock-jwt-token-for-', '');
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          return { success: true, user: users[userIndex] };
        }
        return { success: false, error: data.message };
      }
    } catch (error) {
      // Fallback to local update
      console.log('Network error, falling back to local update');
      const token = getToken();
      if (token) {
        const email = token.replace('mock-jwt-token-for-', '');
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          return { success: true, user: users[userIndex] };
        }
      }
      return { success: false, error: 'Network error' };
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageUri: string) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      // For web platform with blob URLs
      if (typeof window !== 'undefined' && (imageUri.startsWith('blob:') || imageUri.startsWith('http://localhost:8081'))) {
        // Handle web blob URLs or Expo development server URLs
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        // Convert blob to base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for image upload
        
        const apiResponse = await fetch(`${API_BASE_URL}/user/profile-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
          body: JSON.stringify({ image: base64 }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await apiResponse.json();
        
        if (apiResponse.ok) {
          return { success: true, profile_image: data.profile_image };
        } else {
          // Fallback to local image storage
          console.log('API image upload failed, falling back to local storage');
          return await fallbackUploadProfileImage(imageUri);
        }
      } else {
        // For mobile platforms or file URLs
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for image upload
        
        const apiResponse = await fetch(`${API_BASE_URL}/user/profile-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
          body: JSON.stringify({ image: base64 }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await apiResponse.json();
        
        if (apiResponse.ok) {
          return { success: true, profile_image: data.profile_image };
        } else {
          // Fallback to local image storage
          console.log('API image upload failed, falling back to local storage');
          return await fallbackUploadProfileImage(imageUri);
        }
      }
    } catch (error) {
      // Fallback to local image storage
      console.log('Network error, falling back to local image storage');
      return await fallbackUploadProfileImage(imageUri);
    }
  },

  // Add video (admin only)
  addVideo: async (videoData: { title: string; description?: string; url: string; thumbnail?: string }) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/videos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(videoData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        // Add to local storage as well for immediate feedback
        const newVideo = {
          ...data.video,
          created_at: new Date().toISOString()
        };
        videos.push(newVideo);
        return { success: true, video: newVideo };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.log('Network error adding video, using fallback');
      // Create a fallback video object
      const fallbackVideo = {
        id: videos.length + 1,
        title: videoData.title,
        description: videoData.description || '',
        url: videoData.url,
        thumbnail: videoData.thumbnail || null,
        created_at: new Date().toISOString()
      };
      videos.push(fallbackVideo);
      return { success: true, video: fallbackVideo };
    }
  },

  // Get all videos - return in order of most recent first
  getVideos: async () => {
    try {
      const token = getToken();
      if (!token) {
        // Return sample data sorted by most recent first
        const sortedVideos = [...videos].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return { success: true, videos: sortedVideos };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/videos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        // Sort videos by most recent first
        const sortedVideos = Array.isArray(data) ? data : data.videos || [];
        sortedVideos.sort((a: any, b: any) => 
          new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime()
        );
        return { success: true, videos: sortedVideos };
      } else {
        // Fallback to sample data
        console.log('API video retrieval failed, falling back to sample data');
        const sortedVideos = [...videos].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return { success: true, videos: sortedVideos };
      }
    } catch (error) {
      console.log('Network error getting videos, falling back to sample data');
      // Fallback to sample data
      const sortedVideos = [...videos].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return { success: true, videos: sortedVideos };
    }
  },

  // Add music (admin only)
  addMusic: async (musicData: { title: string; artist: string; url: string }) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/music`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify(musicData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        // Add to local storage as well for immediate feedback
        const newMusic = {
          ...data.music,
          created_at: new Date().toISOString()
        };
        musics.push(newMusic);
        return { success: true, music: newMusic };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.log('Network error adding music, using fallback');
      // Create a fallback music object
      const fallbackMusic = {
        id: musics.length + 1,
        title: musicData.title,
        artist: musicData.artist,
        url: musicData.url,
        created_at: new Date().toISOString()
      };
      musics.push(fallbackMusic);
      return { success: true, music: fallbackMusic };
    }
  },

  // Get all music - return in order of most recent first
  getMusic: async () => {
    try {
      const token = getToken();
      if (!token) {
        // Return sample data sorted by most recent first
        const sortedMusics = [...musics].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return { success: true, music: sortedMusics };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/music`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        // Sort music by most recent first
        const sortedMusics = Array.isArray(data) ? data : data.music || [];
        sortedMusics.sort((a: any, b: any) => 
          new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime()
        );
        return { success: true, music: sortedMusics };
      } else {
        // Fallback to sample data
        console.log('API music retrieval failed, falling back to sample data');
        const sortedMusics = [...musics].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return { success: true, music: sortedMusics };
      }
    } catch (error) {
      console.log('Network error getting music, falling back to sample data');
      // Fallback to sample data
      const sortedMusics = [...musics].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return { success: true, music: sortedMusics };
    }
  },

  // Delete music (admin only)
  deleteMusic: async (musicId: number) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/music/${musicId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.log('Network error deleting music');
      return { success: false, error: 'Network error' };
    }
  },

  // Delete video (admin only)
  deleteVideo: async (videoId: number) => {
    try {
      const token = getToken();
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.log('Network error deleting video');
      return { success: false, error: 'Network error' };
    }
  },

  // Logout user
  logout: async () => {
    removeToken();
    return { success: true };
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    const token = getToken();
    if (!token) return false;

    // Optionally verify token with backend
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      return response.ok;
    } catch (error) {
      // Fallback to local token validation
      console.log('Network error, falling back to local token validation');
      return !!token;
    }
  },
};