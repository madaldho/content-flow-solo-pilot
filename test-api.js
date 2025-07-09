const testContent = {
  id: "test-uuid-" + Date.now(),
  title: "Test Content dari API",
  platform: "youtube",
  status: "draft",
  tags: ["test", "api"],
  user_id: "test-user-123"
};

fetch('http://localhost:3001/api/content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testContent)
})
.then(response => response.json())
.then(data => {
  console.log('✅ Create Success:', data);
  
  // Test GET all content
  return fetch('http://localhost:3001/api/content');
})
.then(response => response.json())
.then(data => {
  console.log('✅ Get All Success:', data.length, 'items');
  data.forEach(item => {
    console.log('  -', item.title, '(', item.platform, ')');
  });
})
.catch(error => console.error('❌ Error:', error));
