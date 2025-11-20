// Simple test script to verify impersonate API
const fetch = require('node-fetch');

async function testImpersonateAPI() {
  try {
    console.log('Testing impersonate API...');
    
    // Test POST endpoint (this will fail without proper session, but we can see the response)
    const response = await fetch('http://localhost:7999/api/impersonate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUserId: 'test-user-id'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.status === 401 || response.status === 403) {
      console.log('✅ API is working - returns proper unauthorized response');
    } else {
      console.log('❌ Unexpected response');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testImpersonateAPI();
