// Debug script to test form submission
const API_BASE_URL = 'https://kontenflow.vercel.app/api';

const testFormData = {
  niche: "TEST DEBUG",
  account: "debug_test",
  keywords: "debug keywords",
  audience: 1000,
  revenueStream: "Course",
  pricing: "Rp100000"
};

// Map to database format
const dbEntry = {
  niche: testFormData.niche,
  account: testFormData.account,
  keywords: testFormData.keywords,
  audience: testFormData.audience,
  revenue_stream: testFormData.revenueStream,
  pricing: testFormData.pricing,
};

console.log('Sending data:', dbEntry);

fetch(`${API_BASE_URL}/sweetspot-entries`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(dbEntry),
})
.then(response => {
  console.log('Response status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Error:', error);
});
