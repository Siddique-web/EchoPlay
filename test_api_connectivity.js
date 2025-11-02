const http = require('http');

// Test if the API server is running
const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/health',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Response: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('API server is running and responding');
  });
});

req.on('error', (error) => {
  console.error('Error connecting to API server:', error.message);
  console.log('Please make sure the Python API server is running on port 5000');
});

req.end();