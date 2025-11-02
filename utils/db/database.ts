import { apiService } from '../../services/api';

// Simple in-memory storage for web and fallback
const webStorage: { [key: string]: any[] } = {};

// User session management
let currentUser: any = null;
let isInitialized = false;

// Always use in-memory storage as primary storage to avoid SQLite issues
let db: any = null;

// Web database implementation (primary storage)
const initWebDB = async () => {
  console.log('Using in-memory database implementation');
  isInitialized = true;
  
  // Add default admin user for web
  if (!webStorage.users || webStorage.users.length === 0) {
    webStorage.users = [];
    webStorage.users.push({
      id: 1,
      email: 'admin@gmail.com',
      password: 'Luc14c4$tr0',
      name: 'Admin User',
      profile_image: null,
      created_at: new Date().toISOString()
    });
  }
  
  return true;
};

const registerUserWeb = async (email: string, password: string, name?: string): Promise<any> => {
  console.log('Registering user via API:', email);
  // Use the Python API for registration
  const result = await apiService.register(email, password, name);
  
  if (result.success) {
    currentUser = result.user;
    console.log('Registration successful:', result.user);
    return { insertId: result.user.id };
  } else {
    const errorMessage = (result as any).error || 'Registration failed';
    console.error('Registration failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

const loginUserWeb = async (email: string, password: string): Promise<any> => {
  console.log('Logging in user via API:', email);
  // Use the Python API for login with fallback
  const result = await apiService.login(email, password);
  
  if (result.success) {
    currentUser = result.user;
    console.log('Login successful:', result.user);
    return result.user;
  } else {
    const errorMessage = (result as any).error || 'Login failed';
    console.error('Login failed:', errorMessage);
    // Instead of throwing an error, return null to indicate failed login
    return null;
  }
};

const getUserProfileWeb = async (userId: number): Promise<any> => {
  console.log('Getting user profile via API for user:', userId);
  // Use the Python API to get user profile
  const result = await apiService.getProfile();
  
  if (result.success) {
    console.log('Profile retrieved:', result.user);
    return result.user;
  } else {
    const errorMessage = (result as any).error || 'Failed to get user profile';
    console.error('Failed to get user profile:', errorMessage);
    throw new Error(errorMessage);
  }
};

const updateProfileWeb = async (userId: number, updates: any): Promise<any> => {
  console.log('Updating profile via API for user:', userId, 'with updates:', updates);
  // Use the Python API to update user profile
  const result = await apiService.updateProfile(updates);
  
  if (result.success) {
    currentUser = result.user;
    console.log('Profile updated:', result.user);
    return result.user;
  } else {
    const errorMessage = (result as any).error || 'Failed to update profile';
    console.error('Failed to update profile:', errorMessage);
    throw new Error(errorMessage);
  }
};

const uploadProfileImageWeb = async (imageUri: string): Promise<any> => {
  console.log('Uploading profile image via API:', imageUri);
  // Use the Python API to upload profile image
  const result = await apiService.uploadProfileImage(imageUri);
  
  if (result.success) {
    console.log('Profile image uploaded:', result.profile_image);
    // Update current user with new profile image
    if (currentUser) {
      currentUser.profile_image = result.profile_image;
    }
    return result.profile_image;
  } else {
    const errorMessage = (result as any).error || 'Failed to upload profile image';
    console.error('Failed to upload profile image:', errorMessage);
    throw new Error(errorMessage);
  }
};

const logoutWeb = async (): Promise<void> => {
  console.log('Logging out user via API');
  await apiService.logout();
  currentUser = null;
};

// Public API - Always use in-memory storage
export const initDB = async () => {
  if (isInitialized) {
    console.log('Database already initialized');
    return Promise.resolve(true);
  }
  
  console.log('Initializing in-memory database');
  return initWebDB();
};

export const registerUser = async (email: string, password: string, name?: string): Promise<any> => {
  console.log('Registering user:', email);
  return registerUserWeb(email, password, name);
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  console.log('Logging in user:', email);
  return loginUserWeb(email, password);
};

export const getUserProfile = async (userId: number): Promise<any> => {
  console.log('Getting user profile for user:', userId);
  return getUserProfileWeb(userId);
};

export const updateProfile = async (userId: number, updates: any): Promise<any> => {
  console.log('Updating profile for user:', userId);
  return updateProfileWeb(userId, updates);
};

export const uploadProfileImage = async (imageUri: string): Promise<any> => {
  console.log('Uploading profile image:', imageUri);
  return uploadProfileImageWeb(imageUri);
};

export const logout = async (): Promise<void> => {
  console.log('Logging out user');
  return logoutWeb();
};

export const getCurrentUser = (): any => {
  return currentUser;
};