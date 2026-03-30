async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test registration
    console.log('\n1. Testing registration...');
    const registerResponse = await fetch('http://localhost:5555/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        name: 'Test User',
        password: 'password123'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration status:', registerResponse.status);
    console.log('Registration response:', registerData);
    
    if (registerResponse.ok) {
      const token = registerData.token;
      console.log('Registration successful! Token:', token.substring(0, 20) + '...');
      
      // Test getting user info
      console.log('\n2. Testing user info...');
      const meResponse = await fetch('http://localhost:5555/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const meData = await meResponse.json();
      console.log('User info status:', meResponse.status);
      console.log('User info:', meData);
      
      if (meResponse.ok) {
        console.log('Authentication working correctly!');
      } else {
        console.log('User info test failed');
      }
    } else {
      console.log('Registration failed');
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAuth();
