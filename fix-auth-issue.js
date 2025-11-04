#!/usr/bin/env node

// Script to fix Expo update authorization issues
const { execSync } = require('child_process');

console.log('Fixing Expo Update Authorization Issue');
console.log('===================================');

try {
  // 1. Ensure we're logged in
  console.log('1. Checking login status...');
  const user = execSync('eas whoami', { encoding: 'utf8' });
  console.log(`  ✓ Logged in as: ${user.trim()}`);
  
  // 2. Check project info
  console.log('2. Checking project information...');
  const projectInfo = execSync('eas project:info', { encoding: 'utf8' });
  console.log(projectInfo);
  
  // 3. Publish to production channel to ensure public access
  console.log('3. Publishing to production channel...');
  console.log('  This ensures the update is publicly accessible...');
  
  execSync('eas update --branch production --message "Fix authorization issue - make publicly accessible"', { 
    stdio: 'inherit' 
  });
  
  console.log('  ✓ Successfully published to production channel');
  
  // 4. Also publish to main branch to ensure consistency
  console.log('4. Publishing to main branch...');
  execSync('eas update --branch main --message "Fix authorization issue - main branch sync"', { 
    stdio: 'inherit' 
  });
  
  console.log('  ✓ Successfully published to main branch');
  
  // 5. List updates to verify
  console.log('5. Verifying updates...');
  const updates = execSync('eas update:list --limit 5', { encoding: 'utf8' });
  console.log(updates);
  
  console.log('\n✅ Authorization issue should now be fixed!');
  console.log('\nUsers can now access the app at:');
  console.log('  https://expo.dev/@siddique_faizy_rego/EchoPlay');
  console.log('\nOr scan the QR code from Expo Go with this URL:');
  console.log('  exp://exp.host/@siddique_faizy_rego/EchoPlay');
  
} catch (error) {
  console.error('Error fixing authorization issue:', error.message);
  console.log('\nTroubleshooting steps:');
  console.log('1. Ensure you have owner permissions for the project');
  console.log('2. Check project visibility settings on expo.dev');
  console.log('3. Verify the projectId in app.json matches your Expo project');
  console.log('4. Try running: eas update:configure');
  console.log('5. Contact Expo support if the issue persists');
}