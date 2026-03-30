async function testUserSets() {
  try {
    console.log('🧪 Testing user sets endpoint...');
    
    // First, login to get a token
    console.log('\n1. Logging in...');
    const loginResponse = await fetch('http://localhost:5555/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'maria@example.com',
        password: 'hashedpassword123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');
    
    // Test the user sets endpoint
    console.log('\n2. Fetching user sets...');
    const setsResponse = await fetch('http://localhost:5555/api/sets/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!setsResponse.ok) {
      const errorData = await setsResponse.json();
      throw new Error(`Sets fetch failed: ${errorData.message}`);
    }
    
    const setsData = await setsResponse.json();
    console.log('✅ User sets fetched successfully');
    console.log('Number of sets:', setsData.sets.length);
    console.log('Sets:', setsData.sets.map(set => ({
      id: set.id,
      title: set.title,
      cardCount: set._count?.cards || 0
    })));
    
    console.log('\n🎉 User sets test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserSets();
