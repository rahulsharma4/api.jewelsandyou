// Simple test script to verify authentication
const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Testing registration...');
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'pehaxam',
        email: 'pehaxam126@cnguopin.com',
        password: 'pehaxam126@cnguopin'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    if (registerData.token) {
      console.log('✅ Registration successful!');
      
      console.log('Testing login...');
      const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'pehaxam126@cnguopin.com',
          password: 'pehaxam126@cnguopin'
        })
      });

      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
      
      if (loginData.token) {
        console.log('✅ Login successful!');
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();

