// Test script to verify backend API endpoints
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5555/api';

async function testBackend() {
  console.log('Testing Backend API...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:5555/health');
    const healthData = await healthResponse.json();
    console.log('Health status:', healthData);
    
    if (healthData.status !== 'OK') {
      console.error('❌ Backend health check failed');
      return;
    }
    console.log('✅ Backend is running');
    
    // Test sets endpoint (will fail without auth, but should return proper error)
    console.log('\n2. Testing sets endpoint...');
    try {
      const setsResponse = await fetch(`${API_BASE_URL}/sets`);
      if (setsResponse.status === 401) {
        console.log('✅ Sets endpoint is working (requires authentication)');
      } else {
        console.log('❌ Unexpected response from sets endpoint:', setsResponse.status);
      }
    } catch (error) {
      console.error('❌ Sets endpoint error:', error.message);
    }
    
    // Test cards endpoint (will fail without auth, but should return proper error)
    console.log('\n3. Testing cards endpoint...');
    try {
      const cardsResponse = await fetch(`${API_BASE_URL}/cards/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setId: 'test',
          cards: [{ term: 'test', definition: 'test' }]
        })
      });
      if (cardsResponse.status === 401) {
        console.log('✅ Cards endpoint is working (requires authentication)');
      } else {
        console.log('❌ Unexpected response from cards endpoint:', cardsResponse.status);
      }
    } catch (error) {
      console.error('❌ Cards endpoint error:', error.message);
    }
    
    console.log('\n🎉 Backend API test complete!');
    console.log('\nNext steps:');
    console.log('1. Start the frontend (npm run dev in frontend directory)');
    console.log('2. Try creating a set with cards in the frontend');
    console.log('3. Check browser console for detailed error messages');
    
  } catch (error) {
    console.error('❌ Backend is not running or not accessible:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Make sure you have configured the .env file in the backend directory');
    console.log('2. Run: cd backend && npm run build && npm start');
    console.log('3. Check that the backend starts without errors');
  }
}

testBackend();
