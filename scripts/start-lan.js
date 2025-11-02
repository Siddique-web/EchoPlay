#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

console.log('🚀 Starting Expo with LAN configuration...');
console.log('========================================');

// Get local network interfaces
const interfaces = os.networkInterfaces();
let localIP = null;

// Find the first non-internal IPv4 address
Object.keys(interfaces).forEach(interfaceName => {
  interfaces[interfaceName].forEach(interfaceInfo => {
    if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
      if (!localIP) {
        localIP = interfaceInfo.address;
      }
    }
  });
});

if (localIP) {
  console.log(`🌐 Local IP Address: ${localIP}`);
  console.log('📱 Use this IP to connect from mobile devices');
} else {
  console.log('⚠️  Could not determine local IP address');
}

console.log('\n🔧 Starting Expo with --host lan flag...');
console.log('📝 Scan the QR code with Expo Go camera\n');

// Start Expo with LAN host
const expoProcess = spawn('npx', ['expo', 'start', '--host', 'lan'], {
  stdio: 'inherit',
  shell: true
});

expoProcess.on('close', (code) => {
  console.log(`\n Expo process exited with code ${code}`);
});

expoProcess.on('error', (error) => {
  console.error('Failed to start Expo:', error);
});