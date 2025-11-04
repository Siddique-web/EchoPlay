#!/usr/bin/env node

// Script to verify Expo project configuration
const fs = require('fs');
const path = require('path');

console.log('Expo Project Configuration Verification');
console.log('=====================================');

// Check app.json
console.log('\n1. Checking app.json...');
try {
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  console.log('  ✓ app.json found');
  
  // Check required fields
  const checks = [
    { path: 'expo.name', required: true },
    { path: 'expo.slug', required: true },
    { path: 'expo.updates.url', required: true },
    { path: 'expo.extra.eas.projectId', required: true },
    { path: 'expo.runtimeVersion.policy', required: true }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    const value = getNestedProperty(appJson, check.path);
    if (check.required && !value) {
      console.log(`  ✗ Missing required field: ${check.path}`);
      allPassed = false;
    } else if (value) {
      console.log(`  ✓ ${check.path}: ${value}`);
    }
  }
  
  if (allPassed) {
    console.log('  ✓ All required fields present in app.json');
  }
  
} catch (error) {
  console.error('  ✗ Error reading app.json:', error.message);
}

// Check eas.json
console.log('\n2. Checking eas.json...');
try {
  const easJsonPath = path.join(__dirname, 'eas.json');
  const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
  
  console.log('  ✓ eas.json found');
  
  // Check required fields
  const checks = [
    { path: 'cli.version', required: true },
    { path: 'build.production', required: true },
    { path: 'updates.url', required: false }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    const value = getNestedProperty(easJson, check.path);
    if (check.required && !value) {
      console.log(`  ✗ Missing required field: ${check.path}`);
      allPassed = false;
    } else if (value) {
      console.log(`  ✓ ${check.path}: ${JSON.stringify(value)}`);
    }
  }
  
  if (allPassed) {
    console.log('  ✓ All required fields present in eas.json');
  }
  
} catch (error) {
  console.error('  ✗ Error reading eas.json:', error.message);
}

console.log('\n3. Project Information:');
try {
  const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
  const projectId = appJson.expo.extra.eas.projectId;
  const updateUrl = appJson.expo.updates.url;
  
  console.log(`  Project ID: ${projectId}`);
  console.log(`  Update URL: ${updateUrl}`);
  console.log(`  Project URL: https://expo.dev/accounts/siddique_faizy_rego/projects/EchoPlay`);
  
  if (projectId && updateUrl) {
    console.log('\n✅ Project is properly configured for Expo updates');
    console.log('Users should now be able to access the app without authorization errors');
  } else {
    console.log('\n⚠ Project configuration is incomplete');
    console.log('Please ensure projectId and update URL are properly set');
  }
  
} catch (error) {
  console.error('  ✗ Error getting project information:', error.message);
}

function getNestedProperty(obj, path) {
  return path.split('.').reduce((current, key) => current && current[key], obj);
}