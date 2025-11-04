
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

// Public API - Always use in-memory storage
export const initDB = async () => {
  if (isInitialized) {
    console.log('Database already initialized');
    return Promise.resolve(true);
  }
  
  console.log('Initializing in-memory database');
  return initWebDB();
};

// These functions are now handled by the API service directly
export const registerUser = async (email: string, password: string, name?: string): Promise<any> => {
  console.log('Registering user via API service');
  // This function is now handled by apiService.register directly
  throw new Error('Use apiService.register directly instead');
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  console.log('Logging in user via API service');
  // This function is now handled by apiService.login directly
  throw new Error('Use apiService.login directly instead');
};

export const getUserProfile = async (userId: number): Promise<any> => {
  console.log('Getting user profile via API service');
  // This function is now handled by apiService.getProfile directly
  throw new Error('Use apiService.getProfile directly instead');
};

export const updateProfile = async (userId: number, updates: any): Promise<any> => {
  console.log('Updating profile via API service');
  // This function is now handled by apiService.updateProfile directly
  throw new Error('Use apiService.updateProfile directly instead');
};

export const uploadProfileImage = async (imageUri: string): Promise<any> => {
  console.log('Uploading profile image via API service');
  // This function is now handled by apiService.uploadProfileImage directly
  throw new Error('Use apiService.uploadProfileImage directly instead');
};

export const logout = async (): Promise<void> => {
  console.log('Logging out user via API service');
  // This function is now handled by apiService.logout directly
  throw new Error('Use apiService.logout directly instead');
};

export const getCurrentUser = (): any => {
  return currentUser;
};