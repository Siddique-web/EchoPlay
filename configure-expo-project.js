#!/usr/bin/env node

// Script to configure Expo project for public access
const { execSync } = require('child_process');
const fs = require('fs');

console.log('Configuring Expo project for public access...\n');

try {
  // Check if EAS CLI is installed
  console.log('1. Checking EAS CLI installation...');
  execSync('eas --version', { stdio: 'ignore' });
  console.log('✓ EAS CLI is installed\n');
} catch (error) {
  console.log('⚠ EAS CLI not found. Installing...');
  try {
    execSync('npm install -g eas-cli', { stdio: 'inherit' });
    console.log('✓ EAS CLI installed successfully\n');
  } catch (installError) {
    console.error('✗ Failed to install EAS CLI. Please install it manually with: npm install -g eas-cli');
    process.exit(1);
  }
}

try {
  // Login to Expo (this will prompt for credentials)
  console.log('2. Logging into Expo...');
  console.log('Please enter your Expo credentials when prompted:\n');
  execSync('eas login', { stdio: 'inherit' });
  console.log('✓ Logged into Expo successfully\n');
} catch (error) {
  console.error('✗ Failed to login to Expo. Please login manually with: eas login');
  process.exit(1);
}

try {
  // Configure the project for EAS Update
  console.log('3. Configuring project for EAS Update...');
  execSync('eas update:configure', { stdio: 'inherit' });
  console.log('✓ Project configured for EAS Update\n');
} catch (error) {
  console.error('✗ Failed to configure project for EAS Update. Please run: eas update:configure');
  process.exit(1);
}

// Verify configuration files
console.log('4. Verifying configuration...');

const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
const easJson = JSON.parse(fs.readFileSync('./eas.json', 'utf8'));

if (!appJson.expo.updates || !appJson.expo.updates.url) {
  console.error('✗ Missing updates URL in app.json');
  console.log('Please add the following to your app.json:');
  console.log(`
  "updates": {
    "enabled": true,
    "checkAutomatically": "ON_ERROR_RECOVERY",
    "url": "https://u.expo.dev/YOUR_PROJECT_ID"
  }
  `);
}

if (!appJson.expo.extra || !appJson.expo.extra.eas || !appJson.expo.extra.eas.projectId) {
  console.error('✗ Missing projectId in app.json');
  console.log('Please add your projectId to app.json');
}

if (!appJson.expo.runtimeVersion) {
  console.error('✗ Missing runtimeVersion in app.json');
  console.log('Please add the following to your app.json:');
  console.log(`
  "runtimeVersion": {
    "policy": "appVersion"
  }
  `);
}

console.log('✓ Configuration verification complete\n');

console.log('5. Next steps:');
console.log('To publish an update, run:');
console.log('  eas update --branch production\n');
console.log('To build the app, run:');
console.log('  eas build --profile production --platform all\n');

console.log('\n✅ Expo project configuration complete!');