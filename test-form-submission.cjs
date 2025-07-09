const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testFormSubmission() {
  console.log('🧪 Testing Form Submission...\n');
  
  // Test data exactly as the form would send it
  const formData = {
    niche: "KEY NICHE",
    account: "Test Account",
    keywords: "test keywords",
    audience: 50000,
    revenueStream: "Course", // This is the frontend field name
    pricing: "Rp1,500,000"
  };
  
  console.log('📤 Form data being sent:');
  console.log(JSON.stringify(formData, null, 2));
  
  try {
    const response = await fetch('http://localhost:3001/api/sweetspot/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        niche: formData.niche,
        account: formData.account,
        keywords: formData.keywords,
        audience: formData.audience,
        revenue_stream: formData.revenueStream, // Mapped to database field
        pricing: formData.pricing,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Successfully created entry:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testFormSubmission();
