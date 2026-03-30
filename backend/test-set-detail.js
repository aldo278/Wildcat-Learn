async function testSetDetail() {
  try {
    console.log('🧪 Testing set detail endpoint...');
    
    // First, login to get a token
    console.log('\n1. Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
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
    
    // Get a set ID from the user sets
    console.log('\n2. Getting user sets...');
    const setsResponse = await fetch('http://localhost:3000/api/sets/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!setsResponse.ok) {
      throw new Error('Failed to get sets');
    }
    
    const setsData = await setsResponse.json();
    const firstSet = setsData.sets[0];
    
    if (!firstSet) {
      throw new Error('No sets found');
    }
    
    console.log('✅ Found set:', firstSet.title, 'ID:', firstSet.id);
    
    // Test the set detail endpoint
    console.log('\n3. Fetching set details...');
    const setDetailResponse = await fetch(`http://localhost:3000/api/sets/${firstSet.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!setDetailResponse.ok) {
      throw new Error('Set detail fetch failed');
    }
    
    const setDetailData = await setDetailResponse.json();
    console.log('✅ Set details fetched:', setDetailData.set.title);
    
    // Test the cards endpoint
    console.log('\n4. Fetching cards for set...');
    const cardsResponse = await fetch(`http://localhost:3000/api/cards/set/${firstSet.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!cardsResponse.ok) {
      throw new Error('Cards fetch failed');
    }
    
    const cardsData = await cardsResponse.json();
    console.log('✅ Cards fetched:', cardsData.cards.length, 'cards');
    
    if (cardsData.cards.length > 0) {
      console.log('First card:', cardsData.cards[0]);
    }
    
    console.log('\n🎉 Set detail test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSetDetail();
