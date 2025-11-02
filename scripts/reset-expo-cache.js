const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Resetting Expo cache and clearing update errors...');

try {
  // Clear Expo cache
  console.log('Clearing Expo cache...');
  execSync('npx expo start --clear', { stdio: 'inherit' });
  
  // Clear React Native cache
  console.log('Clearing React Native cache...');
  execSync('npx react-native start --reset-cache', { stdio: 'inherit' });
  
  // Clear Metro cache
  console.log('Clearing Metro cache...');
  const metroCacheDir = path.join(process.env.HOME || process.env.USERPROFILE, '.metro-cache');
  if (fs.existsSync(metroCacheDir)) {
    fs.rmSync(metroCacheDir, { recursive: true, force: true });
    console.log('Metro cache cleared');
  }
  
  // Clear npm cache
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  
  console.log('All caches cleared successfully!');
  console.log('You can now restart your Expo development server with: npx expo start');
  
} catch (error) {
  console.error('Error during cache clearing:', error.message);
  console.log('Please manually restart your Expo development server with: npx expo start --clear');
}