const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAppFunctionality() {
  console.log('Testing app functionality...\n');
  
  // Test Python API
  try {
    console.log('1. Testing Python API connection...');
    const apiResponse = await fetch('http://localhost:5000/api/health');
    const apiData = await apiResponse.json();
    console.log('   Python API Status:', apiData.status);
    console.log('   ✅ Python API is running\n');
  } catch (error) {
    console.log('   ❌ Python API connection failed:', error.message, '\n');
  }
  
  // Test Expo server
  try {
    console.log('2. Testing Expo server connection...');
    const expoResponse = await fetch('http://localhost:8081');
    console.log('   Expo Server Status:', expoResponse.status);
    console.log('   ✅ Expo server is running\n');
  } catch (error) {
    console.log('   ❌ Expo server connection failed:', error.message, '\n');
  }
  
  // Test login with default credentials
  try {
    console.log('3. Testing login with default credentials...');
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'Luc14c4$tr0'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('   Login Status:', loginResponse.status);
    if (loginResponse.ok) {
      console.log('   ✅ Login successful');
      console.log('   Token:', loginData.token ? loginData.token.substring(0, 20) + '...' : 'Not found');
      console.log('   User:', loginData.user ? loginData.user.email : 'Not found');
    } else {
      console.log('   ❌ Login failed:', loginData.message);
    }
    console.log('');
  } catch (error) {
    console.log('   ❌ Login test failed:', error.message, '\n');
  }
  
  console.log('App functionality tests completed!');
}

testAppFunctionality();