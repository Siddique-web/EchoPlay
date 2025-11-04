// Test script to verify API configuration
const API_URL = process.env.API_URL || 'http://192.168.18.93:5000';

console.log('API Configuration Test');
console.log('=====================');
console.log('API_URL:', API_URL);
console.log('Environment:', process.env.NODE_ENV || 'development');

// Test if the URL is properly configured for production
if (API_URL.includes('onrender.com')) {
  console.log('✓ Production API URL is correctly configured');
} else {
  console.log('⚠ Using development API URL:', API_URL);
}

console.log('\nTo use production API, ensure:');
console.log('1. .env file contains: API_URL=https://echoplay-api.onrender.com');
console.log('2. app.json has extra.API_URL set to the same value');
console.log('3. Environment variable is set correctly during build');