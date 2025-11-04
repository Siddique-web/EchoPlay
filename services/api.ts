// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

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

// API URL - Fixed to avoid double /api prefix
const API_BASE_URL = Constants.expoConfig?.extra?.API_URL || 
  process.env.API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://api-echoplay.onrender.com' 
    : 'http://192.168.18.93:5000');

// Store token in memory and AsyncStorage
const storeToken = async (token: string) => {
  currentToken = token;
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

// Get token from memory or AsyncStorage
const getToken = (): string | null => {
  return currentToken;
};

// Get token from AsyncStorage (for initial load)
const getStoredToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    currentToken = token;
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Remove token from memory and AsyncStorage
const removeToken = async () => {
  currentToken = null;
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Generic API request function with better error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getStoredToken();
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {})
  };
  
  // Set default options
  const config: RequestInit = {
    ...options,
    headers
  };
  
  console.log(`Attempting to ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    
    // Handle network errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}: ${errorText}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return {};
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
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
    await storeToken(token);
    
    return { success: true, user, token };
  } else {
    // Check if user exists in our in-memory storage
    const user = users.find(u => u.email.trim().toLowerCase() === normalizedEmail);
    if (user) {
      // In a real app, we would check the password hash
      // For demo purposes, we'll just check if the user exists
      const token = 'mock-jwt-token-for-' + normalizedEmail;
      await storeToken(token);
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
  await storeToken(token);
  
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

// Add sample videos for demonstration
const addSampleVideos = () => {
  // Check if we already have videos to avoid duplicates
  if (videos.length > 0) return;
  
  const sampleVideos = [
    {
      id: 1,
      title: "Sunset Beach Vibes",
      description: "Relaxing beach footage with sunset colors and gentle waves",
      url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Mountain Adventure",
      description: "Breathtaking mountain landscapes and hiking trails",
      url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 3,
      title: "City Night Lights",
      description: "Urban cityscape with beautiful night illumination",
      url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400",
      created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: 4,
      title: "Forest Exploration",
      description: "Peaceful walk through a lush green forest",
      url: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_1mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400",
      created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      id: 5,
      title: "Ocean Waves",
      description: "Calming ocean waves crashing on the shore",
      url: "https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_2mb.mp4",
      thumbnail: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400",
      created_at: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    }
  ];
  
  // Add all sample videos to the videos array
  videos.push(...sampleVideos);
};

// Add sample music for demonstration
const addSampleMusic = () => {
  // Check if we already have music to avoid duplicates
  if (musics.length > 0) return;
  
  const sampleMusics = [
    {
      id: 1,
      title: "Summer Breeze",
      artist: "The Relaxation Collective",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Ocean Dreams",
      artist: "Nature Sounds",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: 3,
      title: "Mountain Echo",
      artist: "Outdoor Vibes",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
      id: 4,
      title: "Forest Whispers",
      artist: "Natural Harmony",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    {
      id: 5,
      title: "City Lights",
      artist: "Urban Beats",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      created_at: new Date(Date.now() - 345600000).toISOString() // 4 days ago
    }
  ];
  
  // Add all sample music to the musics array
  musics.push(...sampleMusics);
};

// Call the functions to add sample content
addSampleVideos();
addSampleMusic();

// API service functions with improved error handling
export const apiService = {
  // Login with improved error handling
  login: async (email: string, password: string) => {
    try {
      console.log('Attempting to login with:', email);
      const response = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (response.success) {
        await storeToken(response.token);
        return { success: true, user: response.user, token: response.token };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      console.log('Network error, falling back to local authentication');
      // Fallback to local authentication
      return await fallbackLogin(email, password);
    }
  },
  
  // Register with improved error handling
  register: async (email: string, password: string, name?: string) => {
    try {
      const response = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      });
      
      if (response.success) {
        await storeToken(response.token);
        return { success: true, user: response.user, token: response.token };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      console.log('Network error, falling back to local registration');
      // Fallback to local registration
      return await fallbackRegister(email, password, name);
    }
  },
  
  // Get user profile with improved error handling
  getProfile: async () => {
    try {
      const response = await apiRequest('/user/profile', {
        method: 'GET'
      });
      
      if (response.success) {
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error || 'Failed to get profile' };
      }
    } catch (error) {
      console.log('Network error getting profile, using local data');
      // Return local user data if available
      const token = getToken();
      if (token) {
        const email = token.replace('mock-jwt-token-for-', '');
        const user = users.find(u => u.email === email);
        if (user) {
          return { success: true, user };
        }
      }
      return { success: false, error: 'Failed to get profile' };
    }
  },
  
  // Update user profile with improved error handling
  updateProfile: async (updates: any) => {
    try {
      const response = await apiRequest('/user/profile', {
        method: 'POST',
        body: JSON.stringify(updates)
      });
      
      if (response.success) {
        return { success: true, user: response.user };
      } else {
        return { success: false, error: response.error || 'Failed to update profile' };
      }
    } catch (error) {
      console.log('Network error updating profile, using local data');
      // Update local user data
      const token = getToken();
      if (token) {
        const email = token.replace('mock-jwt-token-for-', '');
        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          return { success: true, user: users[userIndex] };
        }
      }
      return { success: false, error: 'Failed to update profile' };
    }
  },
  
  // Upload profile image with improved error handling
  uploadProfileImage: async (imageUri: string) => {
    try {
      const response = await apiRequest('/user/profile-image', {
        method: 'POST',
        body: JSON.stringify({ imageUri })
      });
      
      if (response.success) {
        return { success: true, profile_image: response.profile_image };
      } else {
        return { success: false, error: response.error || 'Failed to upload profile image' };
      }
    } catch (error) {
      console.log('Network error uploading profile image, using local data');
      // Fallback to local profile image storage
      return await fallbackUploadProfileImage(imageUri);
    }
  },
  
  // Get videos with improved error handling
  getVideos: async () => {
    try {
      const response = await apiRequest('/videos', {
        method: 'GET'
      });
      
      if (response.success) {
        return { success: true, videos: response.videos || [] };
      } else {
        console.log('Network error getting videos, falling back to sample data');
        return { success: false, error: response.error || 'Failed to get videos', videos: videos };
      }
    } catch (error) {
      console.log('Network error getting videos, falling back to sample data');
      // Return sample videos if network fails
      return { success: false, error: 'Network error', videos: videos };
    }
  },
  
  // Get music with improved error handling
  getMusic: async () => {
    try {
      const response = await apiRequest('/music', {
        method: 'GET'
      });
      
      if (response.success) {
        return { success: true, music: response.music || [] };
      } else {
        console.log('Network error getting music, falling back to sample data');
        return { success: false, error: response.error || 'Failed to get music', music: musics };
      }
    } catch (error) {
      console.log('Network error getting music, falling back to sample data');
      // Return sample music if network fails
      return { success: false, error: 'Network error', music: musics };
    }
  },
  
  // Add video with improved error handling
  addVideo: async (videoData: any) => {
    try {
      const response = await apiRequest('/videos', {
        method: 'POST',
        body: JSON.stringify(videoData)
      });
      
      if (response.success) {
        return { success: true, video: response.video };
      } else {
        return { success: false, error: response.error || 'Failed to add video' };
      }
    } catch (error) {
      console.log('Network error adding video');
      return { success: false, error: 'Network error adding video' };
    }
  },
  
  // Add music with improved error handling
  addMusic: async (musicData: any) => {
    try {
      const response = await apiRequest('/music', {
        method: 'POST',
        body: JSON.stringify(musicData)
      });
      
      if (response.success) {
        return { success: true, music: response.music };
      } else {
        return { success: false, error: response.error || 'Failed to add music' };
      }
    } catch (error) {
      console.log('Network error adding music');
      return { success: false, error: 'Network error adding music' };
    }
  },
  
  // Logout
  logout: async () => {
    try {
      await apiRequest('/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.log('Logout request failed, but proceeding anyway');
    }
    await removeToken();
  },
  
  // Get stored token
  getStoredToken: async () => {
    return await getStoredToken();
  },
  
  // Get current token (for direct use)
  getToken: () => {
    return getToken();
  },
  
  // Store token
  storeToken: async (token: string) => {
    await storeToken(token);
  }
};