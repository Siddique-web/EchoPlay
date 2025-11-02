import * as Network from 'expo-network';
import { Platform } from 'react-native';

export interface NetworkInfo {
  ipAddress: string | null;
  isOnline: boolean;
  networkType: string;
  hostType: 'localhost' | 'lan' | 'tunnel';
}

/**
 * Get network information for the current device
 */
export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  try {
    // Get IP address
    const ipAddress = await Network.getIpAddressAsync();
    
    // Determine if we're online
    const isOnline = ipAddress !== '127.0.0.1' && ipAddress !== '::1';
    
    // Determine network type
    let networkType = 'unknown';
    try {
      const networkState = await Network.getNetworkStateAsync();
      networkType = networkState.type ? networkState.type.toString() : 'unknown';
    } catch (e) {
      console.log('Could not get network state:', e);
    }
    
    // Determine host type
    let hostType: 'localhost' | 'lan' | 'tunnel' = 'localhost';
    if (isOnline && ipAddress && !ipAddress.startsWith('127.')) {
      if (ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.includes('172.')) {
        hostType = 'lan';
      } else {
        hostType = 'tunnel';
      }
    }
    
    return {
      ipAddress,
      isOnline,
      networkType,
      hostType
    };
  } catch (error) {
    console.log('Error getting network info:', error);
    return {
      ipAddress: null,
      isOnline: false,
      networkType: 'unknown',
      hostType: 'localhost'
    };
  }
};

/**
 * Get the best host configuration for development
 */
export const getBestHostConfig = async () => {
  const networkInfo = await getNetworkInfo();
  
  // For development, prefer LAN if available
  if (networkInfo.hostType === 'lan') {
    return {
      hostType: 'lan',
      hostname: networkInfo.ipAddress,
      port: 8081
    };
  }
  
  // Fallback to localhost
  return {
    hostType: 'localhost',
    hostname: 'localhost',
    port: 8081
  };
};

/**
 * Check if Expo Go can connect to the development server
 */
export const checkExpoGoConnectivity = async (): Promise<boolean> => {
  try {
    const networkInfo = await getNetworkInfo();
    
    // If we're on LAN and have an IP, Expo Go should be able to connect
    if (networkInfo.hostType === 'lan' && networkInfo.ipAddress) {
      return true;
    }
    
    // If we're on localhost, Expo Go on the same device should work
    if (networkInfo.hostType === 'localhost') {
      return Platform.OS === 'android' || Platform.OS === 'ios';
    }
    
    return false;
  } catch (error) {
    console.log('Error checking Expo Go connectivity:', error);
    return false;
  }
};

/**
 * Get connection instructions for Expo Go
 */
export const getExpoGoInstructions = async (): Promise<string> => {
  const networkInfo = await getNetworkInfo();
  const hostConfig = await getBestHostConfig();
  
  if (networkInfo.hostType === 'lan') {
    return `Scan the QR code with Expo Go camera.
Ensure your mobile device is on the same WiFi network.
Development server: exp://${hostConfig.hostname}:${hostConfig.port}`;
  }
  
  if (networkInfo.hostType === 'localhost') {
    return `Use the Expo Go camera to scan the QR code.
This works when your mobile device is the same as your development machine.`;
  }
  
  return `Make sure you're connected to a network.
Restart the development server with: npx expo start --host lan`;
};

export default {
  getNetworkInfo,
  getBestHostConfig,
  checkExpoGoConnectivity,
  getExpoGoInstructions
};