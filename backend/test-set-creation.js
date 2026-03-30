async function testSetCreation() {
  try {
    console.log('🧪 Testing set creation...');
    
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
    
    // Create a flashcard set
    console.log('\n2. Creating flashcard set...');
    const setResponse = await fetch('http://localhost:3000/api/sets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Test Set from API',
        description: 'This is a test set created via API',
        isPublic: false
      })
    });
    
    if (!setResponse.ok) {
      const errorData = await setResponse.json();
      throw new Error(`Set creation failed: ${errorData.message}`);
    }
    
    const setData = await setResponse.json();
    console.log('✅ Set created:', setData.set.title, 'ID:', setData.set.id);
    
    // Create flashcards for the set
    console.log('\n3. Creating flashcards...');
    const cardsResponse = await fetch('http://localhost:3000/api/cards/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        setId: setData.set.id,
        cards: [
          { term: 'Test Term 1', definition: 'Test Definition 1' },
          { term: 'Test Term 2', definition: 'Test Definition 2' },
          { term: 'Test Term 3', definition: 'Test Definition 3' }
        ]
      })
    });
    
    if (!cardsResponse.ok) {
      const errorData = await cardsResponse.json();
      throw new Error(`Cards creation failed: ${errorData.message}`);
    }
    
    const cardsData = await cardsResponse.json();
    console.log('✅ Cards created:', cardsData.createdCards.count, 'cards');
    
    // Get the set with cards to verify
    console.log('\n4. Verifying set with cards...');
    const verifyResponse = await fetch(`http://localhost:3000/api/cards/set/${setData.set.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!verifyResponse.ok) {
      throw new Error('Verification failed');
    }
    
    const verifyData = await verifyResponse.json();
    console.log('✅ Verification successful - found', verifyData.cards.length, 'cards');
    
    console.log('\n🎉 Set creation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSetCreation();
