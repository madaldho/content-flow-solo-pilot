const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFixedAPI() {
  console.log('🧪 Testing Fixed API URLs...\n');
  
  const API_BASE_URL = 'http://localhost:3001/api';
  
  // Test all endpoints
  const endpoints = [
    { method: 'GET', path: '/sweetspot/entries', description: 'Get all entries' },
    { method: 'GET', path: '/sweetspot/settings', description: 'Get settings' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing ${endpoint.method} ${endpoint.path}...`);
      const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.description}: Success`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data length: ${Array.isArray(data) ? data.length : 'N/A'}`);
      } else {
        console.log(`❌ ${endpoint.description}: Failed (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.description}: Error - ${error.message}`);
    }
  }
  
  // Test creating an entry
  console.log('\n📝 Testing POST /sweetspot/entries...');
  try {
    const testEntry = {
      niche: 'KEY NICHE',
      account: 'Test Fixed API',
      keywords: 'fixed api test',
      audience: 15000,
      revenue_stream: 'Course',
      pricing: 'Rp2,000,000'
    };
    
    const response = await fetch(`${API_BASE_URL}/sweetspot/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEntry),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Create entry: Success');
      console.log(`   Created ID: ${data.id}`);
    } else {
      console.log(`❌ Create entry: Failed (${response.status})`);
    }
  } catch (error) {
    console.log(`❌ Create entry: Error - ${error.message}`);
  }
  
  console.log('\n🎉 API URL fix test complete!');
}

testFixedAPI();
