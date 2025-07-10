// Test script untuk dijalankan di browser console
// Buka https://kontenflow.vercel.app/sweet-spot/new
// Lalu paste script ini di console browser

// Check environment
console.log('Environment check:');
console.log('import.meta.env.DEV:', typeof window !== 'undefined' ? 'Browser environment' : 'Not browser');
console.log('window.location:', window.location.href);

// Check API config
const isDev = window.location.hostname === 'localhost';
const API_BASE_URL = isDev ? 'http://localhost:3001/api' : 'https://kontenflow.vercel.app/api';
console.log('Detected API_BASE_URL:', API_BASE_URL);

// Test manual submission
const testData = {
  niche: "BROWSER TEST",
  account: "browser_test",
  keywords: "browser keywords",
  audience: 2000,
  revenueStream: "Course",
  pricing: "Rp200000"
};

// Convert to DB format
const dbEntry = {
  niche: testData.niche,
  account: testData.account,
  keywords: testData.keywords,
  audience: testData.audience,
  revenue_stream: testData.revenueStream,
  pricing: testData.pricing,
};

console.log('Sending test data:', dbEntry);

fetch(`${API_BASE_URL}/sweetspot-entries`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(dbEntry),
})
.then(response => {
  console.log('Response status:', response.status);
  if (!response.ok) {
    return response.text().then(text => {
      throw new Error(`HTTP ${response.status}: ${text}`);
    });
  }
  return response.json();
})
.then(data => {
  console.log('SUCCESS! Response data:', data);
})
.catch(error => {
  console.error('ERROR:', error);
});
