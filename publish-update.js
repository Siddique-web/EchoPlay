#!/usr/bin/env node

// Script to publish Expo update
const { execSync } = require('child_process');

console.log('Publishing Expo Update');
console.log('====================');

try {
  // Check if we're logged in
  console.log('1. Checking Expo login status...');
  const whoami = execSync('eas whoami', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  console.log(`  ✓ Logged in as: ${whoami.trim()}\n`);
} catch (error) {
  console.log('  ✗ Not logged in to Expo. Please login first:');
  console.log('    eas login\n');
  process.exit(1);
}

try {
  // Check project configuration
  console.log('2. Checking project configuration...');
  execSync('eas project:info', { stdio: 'ignore' });
  console.log('  ✓ Project is properly configured\n');
} catch (error) {
  console.log('  ✗ Project not configured for EAS. Please run:');
  console.log('    eas build:configure\n');
  process.exit(1);
}

// Publish update
console.log('3. Publishing update...');
console.log('  This may take a few minutes...\n');

try {
  // Create a new update
  execSync('eas update --branch production --message "Fix authorization error"', { 
    stdio: 'inherit' 
  });
  console.log('\n✅ Update published successfully!');
  
  // Get update information
  console.log('\n4. Update Information:');
  try {
    const updates = execSync('eas update:list --limit 1', { encoding: 'utf8' });
    console.log(updates);
  } catch (error) {
    console.log('  Could not retrieve update information');
  }
  
  console.log('\nUsers should now be able to access the app without authorization errors.');
  console.log('The update URL is now publicly accessible.');
  
} catch (error) {
  console.error('\n✗ Failed to publish update:', error.message);
  console.log('\nTroubleshooting steps:');
  console.log('1. Ensure you have the latest EAS CLI: npm install -g eas-cli');
  console.log('2. Verify your project ID in app.json matches your Expo project');
  console.log('3. Check that you have the necessary permissions for this project');
  console.log('4. Try running: eas update --branch production');
}