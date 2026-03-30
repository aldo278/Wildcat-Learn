async function testAISave() {
  try {
    console.log('🧪 Testing AI-generated set save functionality...');
    
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
    
    // Test creating a set with AI-generated data
    console.log('\n2. Creating AI-generated set...');
    const mockAISet = {
      title: 'AI Generated: Test Document',
      description: 'Generated from test.pdf • 3 cards • intermediate difficulty',
      isPublic: true
    };
    
    const setResponse = await fetch('http://localhost:5555/api/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(mockAISet)
    });
    
    if (!setResponse.ok) {
      const errorData = await setResponse.json();
      throw new Error(`Set creation failed: ${errorData.message}`);
    }
    
    const setData = await setResponse.json();
    console.log('✅ Set created successfully:', setData.set.title);
    
    // Test creating cards for the set
    console.log('\n3. Creating AI-generated cards...');
    const mockCards = [
      { term: 'Artificial Intelligence', definition: 'The simulation of human intelligence in machines' },
      { term: 'Machine Learning', definition: 'A subset of AI that enables systems to learn from data' },
      { term: 'Neural Networks', definition: 'Computing systems inspired by biological neural networks' }
    ];
    
    const cardsResponse = await fetch('http://localhost:5555/api/cards/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        setId: setData.set.id,
        cards: mockCards
      })
    });
    
    if (!cardsResponse.ok) {
      const errorData = await cardsResponse.json();
      throw new Error(`Cards creation failed: ${errorData.message}`);
    }
    
    const cardsData = await cardsResponse.json();
    console.log('✅ Cards created successfully:', cardsData.createdCards.count, 'cards');
    
    // Verify the set appears in public sets
    console.log('\n4. Checking public sets...');
    const publicResponse = await fetch('http://localhost:5555/api/sets/public');
    
    if (!publicResponse.ok) {
      throw new Error('Failed to fetch public sets');
    }
    
    const publicData = await publicResponse.json();
    const aiSet = publicData.sets.find(set => set.id === setData.set.id);
    
    if (aiSet) {
      console.log('✅ AI-generated set found in public sets:', aiSet.title);
      console.log('   - Author:', aiSet.author?.name);
      console.log('   - Card count:', aiSet._count?.cards);
      console.log('   - Is Public:', aiSet.isPublic);
    } else {
      console.log('❌ AI-generated set not found in public sets');
    }
    
    console.log('\n🎉 AI save functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAISave();
