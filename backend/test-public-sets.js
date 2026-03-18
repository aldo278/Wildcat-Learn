async function testPublicSets() {
  try {
    console.log('🧪 Testing public sets endpoint...');
    
    // Test the public sets endpoint
    console.log('\n1. Fetching public sets...');
    const response = await fetch('http://localhost:3001/api/sets/public');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Public sets fetch failed: ${errorData.message}`);
    }
    
    const data = await response.json();
    console.log('✅ Public sets fetched successfully');
    console.log('Number of public sets:', data.sets.length);
    console.log('Public sets:', data.sets.map(set => ({
      id: set.id,
      title: set.title,
      isPublic: set.isPublic,
      author: set.author?.name || 'Unknown',
      cardCount: set._count?.cards || 0
    })));
    
    console.log('\n🎉 Public sets test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPublicSets();
