// Verify authentication is working
const https = require('https');
const http = require('http');

async function testAuth() {
  console.log('🔍 Testing authentication endpoints...\n');
  
  try {
    // Test registration
    console.log('1. Testing registration...');
    const registerData = JSON.stringify({
      name: 'pehaxam',
      email: 'pehaxam126@cnguopin.com',
      password: 'pehaxam126@cnguopin'
    });

    const registerOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerData)
      }
    };

    const registerResult = await makeRequest(registerOptions, registerData);
    console.log('Register response:', registerResult);

    if (registerResult.token) {
      console.log('✅ Registration successful!\n');
      
      // Test login
      console.log('2. Testing login...');
      const loginData = JSON.stringify({
        email: 'pehaxam126@cnguopin.com',
        password: 'pehaxam126@cnguopin'
      });

      const loginOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };

      const loginResult = await makeRequest(loginOptions, loginData);
      console.log('Login response:', loginResult);
      
      if (loginResult.token) {
        console.log('✅ Login successful!');
        console.log('\n🎉 Authentication is working perfectly!');
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ error: 'Invalid JSON response', body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

testAuth();

