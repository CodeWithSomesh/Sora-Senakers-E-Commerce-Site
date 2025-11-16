/**
 * Security Features Automated Testing Script
 * Run with: node test-security.js
 *
 * Prerequisites:
 * - Backend running on http://localhost:7000
 * - You must provide a valid JWT token
 */

const BASE_URL = 'http://localhost:7000';
const TEST_EMAIL = 'test@example.com';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

let passCount = 0;
let failCount = 0;

function log(status, message) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.blue;
  console.log(`${color}${symbol} [${timestamp}] ${message}${colors.reset}`);

  if (status === 'PASS') passCount++;
  if (status === 'FAIL') failCount++;
}

function section(title) {
  console.log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}  ${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

async function testEndpoint(name, url, options = {}, expectedStatus, expectedContent = null) {
  try {
    const response = await fetch(url, options);
    const data = await response.text();
    let parsedData;

    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = data;
    }

    if (response.status === expectedStatus) {
      if (expectedContent && typeof parsedData === 'object') {
        const hasExpected = Object.keys(expectedContent).every(key =>
          JSON.stringify(parsedData).includes(expectedContent[key])
        );
        if (hasExpected) {
          log('PASS', `${name}: Status ${response.status} with expected content`);
          return { pass: true, data: parsedData };
        } else {
          log('FAIL', `${name}: Status correct but missing expected content`);
          console.log('   Expected:', expectedContent);
          console.log('   Got:', parsedData);
          return { pass: false, data: parsedData };
        }
      } else {
        log('PASS', `${name}: Status ${response.status}`);
        return { pass: true, data: parsedData };
      }
    } else {
      log('FAIL', `${name}: Expected ${expectedStatus}, got ${response.status}`);
      console.log('   Response:', parsedData);
      return { pass: false, data: parsedData };
    }
  } catch (error) {
    log('FAIL', `${name}: ${error.message}`);
    return { pass: false, error: error.message };
  }
}

async function runTests(jwtToken = null) {
  console.log(`\n${colors.bold}🔒 Security Features Testing Suite${colors.reset}`);
  console.log(`${colors.yellow}Started at: ${new Date().toLocaleString()}${colors.reset}\n`);

  // =====================================================
  // Test 1: Backend Health Check
  // =====================================================
  section('Test 1: Backend Health Check');

  await testEndpoint(
    'Backend Server Running',
    `${BASE_URL}/api/shop/search/Red`,
    { method: 'GET' },
    200
  );

  // =====================================================
  // Test 2: Email Verification Endpoints
  // =====================================================
  section('Test 2: Email Verification');

  // Test check endpoint with missing email
  await testEndpoint(
    'Check Email (Missing Parameter)',
    `${BASE_URL}/api/verification/check`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    },
    400,
    { error: 'Missing email address' }
  );

  // Test check endpoint with email
  await testEndpoint(
    'Check Email (With Email)',
    `${BASE_URL}/api/verification/check`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    },
    404, // Expected if test email doesn't exist
  );

  // Test resend without email
  await testEndpoint(
    'Resend Verification (Missing Email)',
    `${BASE_URL}/api/verification/resend`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    },
    400,
    { error: 'Missing email address' }
  );

  // =====================================================
  // Test 3: Input Validation
  // =====================================================
  section('Test 3: Input Validation (Requires Auth)');

  if (!jwtToken) {
    log('INFO', 'Skipping validation tests - No JWT token provided');
    console.log(`   ${colors.yellow}Run with: node test-security.js YOUR_JWT_TOKEN${colors.reset}`);
  } else {
    // Test user update with missing fields
    await testEndpoint(
      'User Update (Invalid - Empty Name)',
      `${BASE_URL}/api/my/user`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: '',
          addressLine1: '123 Main St',
          city: 'New York',
          country: 'USA'
        })
      },
      400,
      { errors: 'Name must be a string' }
    );
  }

  // =====================================================
  // Test 4: reCAPTCHA Validation
  // =====================================================
  section('Test 4: reCAPTCHA Validation (Requires Auth)');

  if (!jwtToken) {
    log('INFO', 'Skipping reCAPTCHA tests - No JWT token provided');
  } else {
    // Test user creation without reCAPTCHA token
    await testEndpoint(
      'User Creation (Missing reCAPTCHA)',
      `${BASE_URL}/api/my/user`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auth0Id: 'test|123',
          email: 'test@example.com',
          isAdmin: false
        })
      },
      400,
      { message: 'Missing reCAPTCHA token' }
    );

    // Test with invalid reCAPTCHA token
    await testEndpoint(
      'User Creation (Invalid reCAPTCHA)',
      `${BASE_URL}/api/my/user`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          auth0Id: 'test|123',
          email: 'test@example.com',
          isAdmin: false,
          recaptchaToken: 'invalid_token_12345'
        })
      },
      403,
      { message: 'Failed reCAPTCHA verification' }
    );
  }

  // =====================================================
  // Test 5: MFA Security (CRITICAL)
  // =====================================================
  section('Test 5: MFA Authentication & Authorization (CRITICAL)');

  // Test without authentication
  await testEndpoint(
    'MFA Enable (No Auth Token)',
    `${BASE_URL}/api/mfa/enable`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'auth0|123456' })
    },
    401 // Unauthorized - JWT middleware should block
  );

  await testEndpoint(
    'MFA Disable (No Auth Token)',
    `${BASE_URL}/api/mfa/disable`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'auth0|123456' })
    },
    401 // Unauthorized
  );

  if (jwtToken) {
    // Test with authentication but wrong user ID (authorization check)
    await testEndpoint(
      'MFA Enable (Wrong User ID - Auth Check)',
      `${BASE_URL}/api/mfa/enable`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: 'auth0|DIFFERENT_USER_999' })
      },
      403, // Forbidden - should fail authorization check
      { error: 'Unauthorized' }
    );
  } else {
    log('INFO', 'Skipping authenticated MFA tests - No JWT token provided');
    console.log(`   ${colors.yellow}To test MFA authorization:${colors.reset}`);
    console.log(`   ${colors.yellow}1. Login to the app${colors.reset}`);
    console.log(`   ${colors.yellow}2. Get JWT from DevTools → Application → Local Storage${colors.reset}`);
    console.log(`   ${colors.yellow}3. Run: node test-security.js "YOUR_JWT_HERE"${colors.reset}`);
  }

  // =====================================================
  // Test 6: Shop Validation
  // =====================================================
  section('Test 6: Shop/Product Validation');

  if (!jwtToken) {
    log('INFO', 'Skipping shop validation tests - No JWT token provided');
  } else {
    // Test product creation with invalid data
    await testEndpoint(
      'Product Create (Invalid - Negative Price)',
      `${BASE_URL}/api/my/shop`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          shopName: '',
          color: 'Red',
          price: -50,
          category: [],
          sizeStock: []
        })
      },
      400,
      { errors: 'required' }
    );
  }

  // =====================================================
  // Summary
  // =====================================================
  console.log(`\n${colors.bold}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}  Test Summary${colors.reset}`);
  console.log(`${colors.bold}${'='.repeat(60)}${colors.reset}\n`);

  console.log(`${colors.green}✅ Passed: ${passCount}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`);
  console.log(`   Total:  ${passCount + failCount}\n`);

  const successRate = Math.round((passCount / (passCount + failCount)) * 100);

  if (successRate === 100) {
    console.log(`${colors.green}${colors.bold}🎉 All tests passed! Security features are working correctly.${colors.reset}\n`);
  } else if (successRate >= 70) {
    console.log(`${colors.yellow}${colors.bold}⚠️  Most tests passed, but some issues found.${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}🚨 Multiple test failures detected. Please review implementation.${colors.reset}\n`);
  }

  console.log(`${colors.yellow}Completed at: ${new Date().toLocaleString()}${colors.reset}\n`);

  if (!jwtToken) {
    console.log(`\n${colors.yellow}${colors.bold}ℹ️  To run complete tests:${colors.reset}`);
    console.log(`${colors.yellow}   1. Start backend: cd backend && npm run dev${colors.reset}`);
    console.log(`${colors.yellow}   2. Login to http://localhost:5173${colors.reset}`);
    console.log(`${colors.yellow}   3. Get JWT token from browser DevTools${colors.reset}`);
    console.log(`${colors.yellow}   4. Run: node test-security.js "YOUR_JWT_TOKEN"${colors.reset}\n`);
  }

  process.exit(failCount > 0 ? 1 : 0);
}

// Run tests
const jwtToken = process.argv[2];
runTests(jwtToken).catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
