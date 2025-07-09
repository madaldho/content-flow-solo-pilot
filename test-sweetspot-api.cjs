const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testSweetSpotAPI() {
  try {
    console.log('🧪 Testing Sweet Spot API endpoints...');
    
    // Test GET entries
    console.log('📋 Testing GET /api/sweetspot/entries...');
    const entriesResponse = await fetch('http://localhost:3001/api/sweetspot/entries');
    const entries = await entriesResponse.json();
    console.log('✅ GET entries:', entries);
    
    // Test GET settings
    console.log('⚙️  Testing GET /api/sweetspot/settings...');
    const settingsResponse = await fetch('http://localhost:3001/api/sweetspot/settings');
    const settings = await settingsResponse.json();
    console.log('✅ GET settings:', settings);
    
    // Test POST entry
    console.log('➕ Testing POST /api/sweetspot/entries...');
    const newEntry = {
      niche: 'TEST NICHE',
      account: 'Test Account',
      keywords: 'test keyword',
      audience: 50000,
      revenue_stream: 'Course',
      pricing: 'Rp500,000'
    };
    
    const postResponse = await fetch('http://localhost:3001/api/sweetspot/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEntry)
    });
    
    const createdEntry = await postResponse.json();
    console.log('✅ POST entry:', createdEntry);
    
    // Test GET entries again
    console.log('📋 Testing GET /api/sweetspot/entries again...');
    const entriesResponse2 = await fetch('http://localhost:3001/api/sweetspot/entries');
    const entries2 = await entriesResponse2.json();
    console.log('✅ GET entries after POST:', entries2);
    
    console.log('🎉 All API tests passed!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

testSweetSpotAPI();
