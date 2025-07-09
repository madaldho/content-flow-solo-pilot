// Test the SweetSpot form submission manually
const testData = {
  niche: "KEY NICHE",
  account: "Manual Test Account",
  keywords: "manual test keywords",
  audience: 75000,
  revenueStream: "Course",
  pricing: "Rp2,000,000"
};

async function testManualSubmission() {
  console.log('🧪 Manual Test: Testing SweetSpot form submission...');
  console.log('📤 Test data:', testData);
  
  try {
    // Test the service directly
    const { sweetSpotService } = await import('./src/services/sweetSpotService.js');
    
    const result = await sweetSpotService.createEntry(testData);
    console.log('✅ Manual Test: Success!', result);
    
    // Test getting the data back
    const allEntries = await sweetSpotService.getData();
    console.log('📋 All entries:', allEntries.length);
    
    return result;
  } catch (error) {
    console.error('❌ Manual Test: Error!', error);
    throw error;
  }
}

// Make it available for testing
if (typeof window !== 'undefined') {
  window.testManualSubmission = testManualSubmission;
}

export default testManualSubmission;
