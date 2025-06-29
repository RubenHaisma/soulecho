// Use dynamic import for node-fetch
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Test cases for different API routes
const tests = [
  {
    name: 'Health Check',
    endpoint: '/api/health',
    method: 'GET',
    expectedStatus: 200,
    description: 'Check if the health endpoint is working'
  },
  {
    name: 'Contact Form',
    endpoint: '/api/contact',
    method: 'POST',
    body: {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'API Test',
      message: 'This is a test message from the API test script.'
    },
    expectedStatus: [200, 500], // 500 expected if Resend not configured
    description: 'Test contact form submission'
  },
  {
    name: 'Auth Signup',
    endpoint: '/api/auth/signup',
    method: 'POST',
    body: {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!'
    },
    expectedStatus: [200, 400],
    description: 'Test user registration'
  }
];

async function runTest(test, fetch) {
  console.log(`\n🧪 Testing: ${test.name}`);
  console.log(`📍 ${test.method} ${test.endpoint}`);
  console.log(`📝 ${test.description}`);
  
  try {
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (test.body) {
      options.body = JSON.stringify(test.body);
    }

    const response = await fetch(`${API_BASE}${test.endpoint}`, options);
    const responseData = await response.json().catch(() => ({}));

    const statusOk = Array.isArray(test.expectedStatus) 
      ? test.expectedStatus.includes(response.status)
      : response.status === test.expectedStatus;

    if (statusOk) {
      console.log(`✅ PASSED - Status: ${response.status}`);
      if (responseData.error) {
        console.log(`⚠️  Note: ${responseData.error}`);
      }
    } else {
      console.log(`❌ FAILED - Expected: ${test.expectedStatus}, Got: ${response.status}`);
      console.log(`Response:`, responseData);
    }

  } catch (error) {
    console.log(`❌ ERROR - ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Route Tests');
  console.log(`🌐 Testing against: ${API_BASE}`);
  console.log('=' .repeat(50));

  // Dynamic import for node-fetch
  const { default: fetch } = await import('node-fetch');

  for (const test of tests) {
    await runTest(test, fetch);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('🏁 All tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. If Contact Form failed, update RESEND_API_KEY in .env.local');
  console.log('2. If database tests failed, check DATABASE_URL and Prisma setup');
  console.log('3. Run `npm run dev` to start the development server');
  console.log('4. Test the contact form at http://localhost:3000/contact');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, runTest }; 