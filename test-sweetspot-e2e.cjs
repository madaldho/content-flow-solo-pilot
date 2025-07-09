const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3001';

// Helper function to test API endpoints
async function testEndpoint(method, path, data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${BASE_URL}${path}`, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

async function runE2ETest() {
  console.log('🧪 Running Sweet Spot E2E Tests...\n');
  
  try {
    // Test 1: Clean up existing data
    console.log('🧹 Step 1: Clean up existing data...');
    const existingEntries = await testEndpoint('GET', '/api/sweetspot/entries');
    for (const entry of existingEntries) {
      await testEndpoint('DELETE', `/api/sweetspot/entries/${entry.id}`);
    }
    console.log('✅ Cleanup completed\n');
    
    // Test 2: Create multiple entries
    console.log('📝 Step 2: Create multiple entries...');
    const entries = [
      {
        niche: 'KEY NICHE',
        account: 'Instagram @techreview',
        keywords: 'tech review, gadget',
        audience: 120000,
        revenue_stream: 'Affiliate Marketing',
        pricing: 'Rp2,500,000'
      },
      {
        niche: 'KEY NICHE',
        account: 'YouTube TechChannel',
        keywords: 'smartphone, laptop',
        audience: 80000,
        revenue_stream: 'Sponsorship',
        pricing: 'Rp3,000,000'
      },
      {
        niche: 'BENANG MERAH NICHE',
        account: 'TikTok @techlife',
        keywords: 'tech lifestyle',
        audience: 50000,
        revenue_stream: 'Course',
        pricing: 'Rp1,500,000'
      }
    ];
    
    const createdEntries = [];
    for (const entry of entries) {
      const created = await testEndpoint('POST', '/api/sweetspot/entries', entry);
      createdEntries.push(created);
      console.log(`✅ Created entry: ${created.account}`);
    }
    console.log(`✅ Created ${createdEntries.length} entries\n`);
    
    // Test 3: Update settings
    console.log('⚙️  Step 3: Update target revenue...');
    await testEndpoint('PUT', '/api/sweetspot/settings', {
      target_revenue_per_month: '15000000'
    });
    const updatedSettings = await testEndpoint('GET', '/api/sweetspot/settings');
    console.log(`✅ Updated target revenue: Rp${parseInt(updatedSettings.target_revenue_per_month).toLocaleString()}\n`);
    
    // Test 4: Get and verify all entries
    console.log('📋 Step 4: Verify all entries...');
    const allEntries = await testEndpoint('GET', '/api/sweetspot/entries');
    console.log(`✅ Found ${allEntries.length} entries:`);
    
    // Group by niche
    const nicheGroups = {};
    allEntries.forEach(entry => {
      if (!nicheGroups[entry.niche]) {
        nicheGroups[entry.niche] = [];
      }
      nicheGroups[entry.niche].push(entry);
    });
    
    // Calculate analysis
    let grandTotal = 0;
    for (const [niche, entries] of Object.entries(nicheGroups)) {
      const nicheTotal = entries.reduce((sum, entry) => sum + entry.audience, 0);
      const assumptionPercentage = niche === 'KEY NICHE' ? 10 : 5;
      const assumptionAudience = Math.round(nicheTotal * (assumptionPercentage / 100));
      
      console.log(`  ${niche}: ${nicheTotal.toLocaleString()} (${assumptionPercentage}% = ${assumptionAudience.toLocaleString()})`);
      grandTotal += assumptionAudience;
    }
    
    console.log(`  Grand Total: ${grandTotal.toLocaleString()}`);
    
    // Test 5: Calculate final metrics
    console.log('\n📊 Step 5: Calculate final metrics...');
    const conversion = Math.round(grandTotal * 0.01); // 1% conversion
    const targetRevenue = parseInt(updatedSettings.target_revenue_per_month);
    const salesPerMonth = Math.round(conversion * 0.1); // 10% of conversion
    const productPrice = Math.round(targetRevenue / salesPerMonth);
    
    console.log(`  Grand Total: ${grandTotal.toLocaleString()}`);
    console.log(`  Conversion (1%): ${conversion.toLocaleString()}`);
    console.log(`  Monthly Sales: ${salesPerMonth}`);
    console.log(`  Target Revenue: Rp${targetRevenue.toLocaleString()}`);
    console.log(`  Product Price: Rp${productPrice.toLocaleString()}\n`);
    
    // Test 6: Test update functionality
    console.log('✏️  Step 6: Test update functionality...');
    const entryToUpdate = createdEntries[0];
    const updatedEntry = await testEndpoint('PUT', `/api/sweetspot/entries/${entryToUpdate.id}`, {
      niche: entryToUpdate.niche,
      account: entryToUpdate.account,
      keywords: entryToUpdate.keywords,
      audience: 150000,
      revenue_stream: entryToUpdate.revenue_stream,
      pricing: 'Rp4,000,000'
    });
    console.log(`✅ Updated entry: ${updatedEntry.account} - audience: ${updatedEntry.audience.toLocaleString()}\n`);
    
    // Test 7: Test delete functionality  
    console.log('🗑️  Step 7: Test delete functionality...');
    await testEndpoint('DELETE', `/api/sweetspot/entries/${entryToUpdate.id}`);
    const finalEntries = await testEndpoint('GET', '/api/sweetspot/entries');
    console.log(`✅ Deleted entry. Remaining entries: ${finalEntries.length}\n`);
    
    console.log('🎉 All E2E tests passed! SweetSpot functionality is working correctly with the database.');
    
  } catch (error) {
    console.error('❌ E2E test failed:', error);
    process.exit(1);
  }
}

// Run the test
runE2ETest();
