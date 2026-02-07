const request = require('supertest');
const app = require('./dist/app').default;

async function testAuth() {
  console.log('Testing auth...\n');

  // Test register
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!',
    first_name: 'Test',
    last_name: 'User'
  };

  console.log('1. Testing /api/v1/auth/register...');
  const registerRes = await request(app)
    .post('/api/v1/auth/register')
    .send(testUser);

  console.log('Status:', registerRes.status);
  console.log('Body:', JSON.stringify(registerRes.body, null, 2));

  if (registerRes.status === 201) {
    console.log('\n✅ Register successful');
    console.log('Token:', registerRes.body.data.token);
  } else {
    console.log('\n❌ Register failed');
  }

  // Test login
  console.log('\n2. Testing /api/v1/auth/login...');
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: testUser.email, password: testUser.password });

  console.log('Status:', loginRes.status);
  console.log('Body:', JSON.stringify(loginRes.body, null, 2));

  if (loginRes.status === 200) {
    console.log('\n✅ Login successful');
  } else {
    console.log('\n❌ Login failed');
  }
}

testAuth().catch(console.error);
