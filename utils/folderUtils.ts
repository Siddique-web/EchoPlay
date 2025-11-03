import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FolderItem {
  id: string;
  title: string;
  artist?: string;
  duration?: string;
  thumbnail?: string;
  url: string;
  createdAt?: string;
  description?: string;
}

export interface Folder {
  id: string;
  name: string;
  type: 'music' | 'video';
  items: FolderItem[];
  createdAt: string;
}

/**
 * Get all folders from storage
 */
export const getFolders = async (): Promise<Folder[]> => {
  try {
    const storedFolders = await AsyncStorage.getItem('userFolders');
    return storedFolders ? JSON.parse(storedFolders) : [];
  } catch (error) {
    console.error('Error getting folders:', error);
    return [];
  }
};

/**
 * Save folders to storage
 */
export const saveFolders = async (folders: Folder[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('userFolders', JSON.stringify(folders));
  } catch (error) {
    console.error('Error saving folders:', error);
    throw error;
  }
};

/**
 * Add item to a specific folder
 */
export const addItemToFolder = async (folderId: string, item: FolderItem): Promise<boolean> => {
  try {
    const folders = await getFolders();
    const folderIndex = folders.findIndex(folder => folder.id === folderId);
    
    if (folderIndex === -1) {
      throw new Error('Folder not found');
    }
    
    // Check if item already exists in folder
    const itemExists = folders[folderIndex].items.some(i => i.id === item.id);
    if (itemExists) {
      throw new Error('Item already exists in this folder');
    }
    
    // Add item to folder
    folders[folderIndex].items.push(item);
    
    // Save updated folders
    await saveFolders(folders);
    return true;
  } catch (error) {
    console.error('Error adding item to folder:', error);
    throw error;
  }
};

/**
 * Remove item from a specific folder
 */
export const removeItemFromFolder = async (folderId: string, itemId: string): Promise<boolean> => {
  try {
    const folders = await getFolders();
    const folderIndex = folders.findIndex(folder => folder.id === folderId);
    
    if (folderIndex === -1) {
      throw new Error('Folder not found');
    }
    
    // Remove item from folder
    folders[folderIndex].items = folders[folderIndex].items.filter(item => item.id !== itemId);
    
    // Save updated folders
    await saveFolders(folders);
    return true;
  } catch (error) {
    console.error('Error removing item from folder:', error);
    throw error;
  }
};

/**
 * Get folders by type (music or video)
 */
export const getFoldersByType = async (type: 'music' | 'video'): Promise<Folder[]> => {
  try {
    const folders = await getFolders();
    return folders.filter(folder => folder.type === type);
  } catch (error) {
    console.error('Error getting folders by type:', error);
    return [];
  }
};

/**
 * Create a new folder
 */
export const createFolder = async (name: string, type: 'music' | 'video'): Promise<Folder> => {
  try {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      items: [],
      createdAt: new Date().toISOString(),
    };

    const folders = await getFolders();
    folders.push(newFolder);
    await saveFolders(folders);
    
    return newFolder;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

/**
 * Delete a folder
 */
export const deleteFolder = async (folderId: string): Promise<boolean> => {
  try {
    const folders = await getFolders();
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    await saveFolders(updatedFolders);
    return true;
  } catch (error) {
    console.error('Error deleting folder:', error);
    throw error;
  }
};