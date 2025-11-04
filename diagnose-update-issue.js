#!/usr/bin/env node

// Script to diagnose Expo update authorization issues
const { execSync } = require('child_process');

console.log('Expo Update Authorization Diagnostic');
console.log('==================================');

try {
  // Check project info
  console.log('1. Project Information:');
  const projectInfo = execSync('eas project:info', { encoding: 'utf8' });
  console.log(projectInfo);
  
  // Check current user
  console.log('2. Current User:');
  const user = execSync('eas whoami', { encoding: 'utf8' });
  console.log(user);
  
  // Check update configuration
  console.log('3. Update Configuration:');
  const updateConfig = execSync('eas update:configure --dry-run', { encoding: 'utf8' });
  console.log(updateConfig);
  
  // List branches
  console.log('4. Update Branches:');
  try {
    const branches = execSync('eas branch:list', { encoding: 'utf8' });
    console.log(branches);
  } catch (error) {
    console.log('  No branches found or error listing branches');
  }
  
  // Check specific update
  console.log('5. Recent Updates:');
  try {
    const updates = execSync('eas update:list --limit 3', { encoding: 'utf8' });
    console.log(updates);
  } catch (error) {
    console.log('  Error listing updates');
  }
  
  // Check project settings
  console.log('6. Project Settings Check:');
  console.log('  - Project ID in app.json:', getProjectIdFromAppJson());
  console.log('  - Update URL in app.json:', getUpdateUrlFromAppJson());
  console.log('  - Runtime Version:', getRuntimeVersionFromAppJson());
  
  console.log('\n7. Common Issues and Solutions:');
  console.log('  a) Ensure project visibility is set to "Public" or "Unlisted" on expo.dev');
  console.log('  b) Verify the update was published to the correct branch');
  console.log('  c) Check that runtime versions match between builds and updates');
  console.log('  d) Confirm you have owner/admin permissions for the project');
  
} catch (error) {
  console.error('Error during diagnostic:', error.message);
}

function getProjectIdFromAppJson() {
  try {
    const fs = require('fs');
    const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
    return appJson.expo.extra.eas.projectId;
  } catch (error) {
    return 'Not found';
  }
}

function getUpdateUrlFromAppJson() {
  try {
    const fs = require('fs');
    const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
    return appJson.expo.updates.url;
  } catch (error) {
    return 'Not found';
  }
}

function getRuntimeVersionFromAppJson() {
  try {
    const fs = require('fs');
    const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
    return appJson.expo.runtimeVersion.policy || appJson.expo.runtimeVersion;
  } catch (error) {
    return 'Not found';
  }
}