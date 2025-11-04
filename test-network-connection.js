#!/usr/bin/env node

// Script to test network connection to the API
const https = require('https');
const http = require('http');
const url = require('url');

console.log('Testing network connection to API...');
console.log('================================');

// Test URLs
const testUrls = [
  'https://echoplay-apii.onrender.com/api/health',
  'http://192.168.18.93:5000/api/health'
];

function testUrl(apiUrl) {
  return new Promise((resolve) => {
    console.log(`\nTesting: ${apiUrl}`);
    
    const parsedUrl = url.parse(apiUrl);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.path,
      method: 'GET',
      timeout: 5000 // 5 second timeout
    };
    
    const req = protocol.request(options, (res) => {
      console.log(`  Status: ${res.statusCode}`);
      //console.log(`  Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`  Response: ${JSON.stringify(jsonData, null, 2)}`);
          resolve({ success: true, status: res.statusCode, data: jsonData });
        } catch (e) {
          console.log(`  Response (text): ${data}`);
          resolve({ success: true, status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log(`  Error: ${e.message}`);
      resolve({ success: false, error: e.message });
    });
    
    req.on('timeout', () => {
      console.log(`  Error: Request timeout`);
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });
    
    req.end();
  });
}

async function runTests() {
  for (const apiUrl of testUrls) {
    try {
      await testUrl(apiUrl);
    } catch (error) {
      console.log(`Failed to test ${apiUrl}: ${error.message}`);
    }
  }
  
  console.log('\nNetwork test completed.');
}

runTests();