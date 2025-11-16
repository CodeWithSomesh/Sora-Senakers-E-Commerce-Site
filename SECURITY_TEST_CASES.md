# 🔒 Security Features Testing Guide

## Overview
This document contains comprehensive test cases for all 7 security features implemented in the Sora Sneakers E-Commerce Site.

**Testing Date:** 2025-11-16
**Tester:** _____________
**Environment:** Development (localhost)

---

## Prerequisites

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev
# Should run on http://localhost:7000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
# Should run on http://localhost:5173
```

### 2. Required Tools
- Browser DevTools (Network tab, Console)
- Postman/Insomnia (for API testing)
- Valid email account for testing
- Auth0 account access

---

## Test Case 1: Input Validation

### 1.1 User Profile Validation (Frontend + Backend)

**Test Steps:**
1. Login to the application
2. Navigate to User Profile page
3. Try to submit the form with empty fields

**Test Cases:**

| Test ID | Field | Input | Expected Result | Status |
|---------|-------|-------|-----------------|--------|
| IV-001 | Name | Empty string | ❌ Error: "name is required" | ☐ Pass ☐ Fail |
| IV-002 | Name | "John Doe" | ✅ Accepted | ☐ Pass ☐ Fail |
| IV-003 | Address Line 1 | Empty string | ❌ Error: "Address Line 1 is required" | ☐ Pass ☐ Fail |
| IV-004 | City | Empty string | ❌ Error: "City is required" | ☐ Pass ☐ Fail |
| IV-005 | Country | Empty string | ❌ Error: "Country is required" | ☐ Pass ☐ Fail |
| IV-006 | All fields | Valid data | ✅ "User profile updated!" | ☐ Pass ☐ Fail |

**Backend Validation Test (API):**
```bash
# Test with missing fields using curl or Postman
curl -X PUT http://localhost:7000/api/my/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "addressLine1": "123 Main St",
    "city": "New York",
    "country": "USA"
  }'

# Expected: 400 Bad Request with validation errors
```

**Expected Response:**
```json
{
  "errors": [
    {
      "msg": "Name must be a string",
      "param": "name"
    }
  ]
}
```

### 1.2 Shop/Product Validation

**Test Steps:**
1. Login as admin user
2. Navigate to "Add Product" page
3. Test product creation with invalid data

| Test ID | Field | Input | Expected Result | Status |
|---------|-------|-------|-----------------|--------|
| IV-101 | Shop Name | Empty | ❌ "Shop name is required" | ☐ Pass ☐ Fail |
| IV-102 | Color | Empty | ❌ "Color name is required" | ☐ Pass ☐ Fail |
| IV-103 | Price | -10 | ❌ "Price must be a positive number" | ☐ Pass ☐ Fail |
| IV-104 | Price | "abc" | ❌ "Price must be a positive number" | ☐ Pass ☐ Fail |
| IV-105 | Category | Empty array [] | ❌ "Category array cannot be empty" | ☐ Pass ☐ Fail |
| IV-106 | Category | "string" | ❌ "Category must be an array" | ☐ Pass ☐ Fail |
| IV-107 | Size Stock | Missing size | ❌ "Size name is required" | ☐ Pass ☐ Fail |
| IV-108 | Size Stock | Missing stock | ❌ "Stock name is required" | ☐ Pass ☐ Fail |

**API Test (Postman):**
```bash
curl -X POST http://localhost:7000/api/my/shop \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shopName": "",
    "color": "Red",
    "price": -50,
    "category": [],
    "sizeStock": []
  }'

# Expected: 400 Bad Request with validation errors
```

### 1.3 URL Parameter Validation

**Test the fixed color parameter:**
```bash
# Test search by color endpoint
curl http://localhost:7000/api/shop/search/Red

# Should validate "color" parameter, not "city" (this was the bug we fixed)
# Expected: Valid response or proper validation error
```

---

## Test Case 2: Google reCAPTCHA

### 2.1 User Registration with reCAPTCHA

**⚠️ IMPORTANT:** This requires the manual fix in AuthCallbackPage.tsx to be applied first!

**Test Steps:**
1. Logout from the application
2. Click "Sign Up" or "Login" button
3. Open Browser DevTools → Network tab
4. Register a new account with Auth0

**Test Cases:**

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| RC-001 | reCAPTCHA token generated on signup | Console shows "reCAPTCHA token: ey..." | ☐ Pass ☐ Fail |
| RC-002 | Token sent to backend | Network tab shows POST /api/my/user with recaptchaToken in body | ☐ Pass ☐ Fail |
| RC-003 | Backend validates token | No 403 error, user created successfully | ☐ Pass ☐ Fail |
| RC-004 | Invalid/missing token | 400 error: "Missing reCAPTCHA token" | ☐ Pass ☐ Fail |

**Manual API Test (Without Token):**
```bash
curl -X POST http://localhost:7000/api/my/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "auth0Id": "auth0|123456",
    "email": "test@example.com",
    "isAdmin": false
  }'

# Expected: 400 Bad Request - "Missing reCAPTCHA token"
```

**Manual API Test (With Invalid Token):**
```bash
curl -X POST http://localhost:7000/api/my/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "auth0Id": "auth0|123456",
    "email": "test@example.com",
    "isAdmin": false,
    "recaptchaToken": "invalid_token_123"
  }'

# Expected: 403 Forbidden - "Failed reCAPTCHA verification"
```

### 2.2 Verify Backend Secret Key

**Check Environment Variable:**
```bash
# In backend directory
cat .env | grep RECAPTCHA_SECRET_KEY

# Should show actual secret key, not the site key
# Format: 6Le... (different from site key)
```

---

## Test Case 3: Login Limiting, Blocking & Unblocking

**Note:** This is managed by Auth0. Test via Auth0 dashboard.

### 3.1 Brute Force Protection

**Test Steps:**
1. Logout from application
2. Attempt login with wrong password 10+ times
3. Check if account gets temporarily blocked

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| LL-001 | 10 failed login attempts | Account temporarily blocked | ☐ Pass ☐ Fail |
| LL-002 | Blocked account tries to login | "Too many attempts" error | ☐ Pass ☐ Fail |
| LL-003 | Wait 15-30 minutes | Account automatically unblocked | ☐ Pass ☐ Fail |

### 3.2 Auth0 Dashboard Verification

**Navigate to:** Auth0 Dashboard → Monitoring → Logs

| Test ID | Check | Expected | Status |
|---------|-------|----------|--------|
| LL-101 | Failed login attempts logged | Shows "Failed Login" events | ☐ Pass ☐ Fail |
| LL-102 | Blocked user events | Shows "Limit Exceeded" events | ☐ Pass ☐ Fail |
| LL-103 | Anomaly detection active | Enabled in Security settings | ☐ Pass ☐ Fail |

---

## Test Case 4: Data Privacy Policy

### 4.1 Privacy Policy Page Accessibility

| Test ID | Test | Expected Result | Status |
|---------|------|-----------------|--------|
| PP-001 | Navigate to /privacyPolicy | Page loads successfully | ☐ Pass ☐ Fail |
| PP-002 | Check "Last Updated" date | Shows "November 15, 2025" | ☐ Pass ☐ Fail |
| PP-003 | Verify all sections present | 11 sections visible (see checklist below) | ☐ Pass ☐ Fail |

### 4.2 Content Verification Checklist

☐ Interpretation and Definitions
☐ Types of Data Collected
☐ Third-Party Services (Auth0, reCAPTCHA)
☐ Tracking Technologies and Cookies
☐ Use of Personal Data
☐ Data Retention Policy
☐ Data Transfer and Security
☐ User Rights (Delete, Access, Correct)
☐ Business Transactions Disclosure
☐ Children's Privacy (under 13)
☐ Contact Information

### 4.3 Legal Compliance

| Test ID | Requirement | Check | Status |
|---------|-------------|-------|--------|
| PP-101 | GDPR compliance mentions | User rights section present | ☐ Pass ☐ Fail |
| PP-102 | Third-party services listed | Auth0 and Google mentioned | ☐ Pass ☐ Fail |
| PP-103 | Contact information | Email address provided | ☐ Pass ☐ Fail |

---

## Test Case 5: Forgot Password Implementation

**Note:** Managed by Auth0

### 5.1 Password Reset Flow

**Test Steps:**
1. Logout from application
2. Click "Login"
3. On Auth0 login screen, click "Forgot Password?"
4. Enter email address
5. Check email inbox

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| FP-001 | Click "Forgot Password" | Redirects to Auth0 password reset page | ☐ Pass ☐ Fail |
| FP-002 | Enter valid email | "Email sent" confirmation | ☐ Pass ☐ Fail |
| FP-003 | Check email inbox | Password reset email received within 2 minutes | ☐ Pass ☐ Fail |
| FP-004 | Click reset link | Opens Auth0 password reset form | ☐ Pass ☐ Fail |
| FP-005 | Set new password | Password updated successfully | ☐ Pass ☐ Fail |
| FP-006 | Login with new password | Login successful | ☐ Pass ☐ Fail |
| FP-007 | Try old password | Login fails | ☐ Pass ☐ Fail |

### 5.2 Security Checks

| Test ID | Security Check | Expected Behavior | Status |
|---------|---------------|-------------------|--------|
| FP-101 | Reset link expiration | Link expires after 24 hours | ☐ Pass ☐ Fail |
| FP-102 | Password complexity | Requires 8+ chars, upper, lower, number | ☐ Pass ☐ Fail |
| FP-103 | One-time use link | Link invalid after password reset | ☐ Pass ☐ Fail |

---

## Test Case 6: Email Verification

### 6.1 New User Email Verification

**Test Steps:**
1. Create a new Auth0 account (use a real email)
2. Check email for verification link
3. Test the verification flow

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| EV-001 | New user registration | Verification email sent automatically | ☐ Pass ☐ Fail |
| EV-002 | Click verification link | Email verified, redirected to login | ☐ Pass ☐ Fail |
| EV-003 | Login before verification | Shows "Email Not Verified" error page | ☐ Pass ☐ Fail |

### 6.2 Manual Verification Check API

**Test the verification check endpoint:**
```bash
curl -X POST http://localhost:7000/api/verification/check \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@example.com"
  }'

# Expected Response (if verified):
{
  "verified": true
}

# Expected Response (if not verified):
{
  "verified": false
}
```

| Test ID | Email Status | Expected Response | Status |
|---------|-------------|-------------------|--------|
| EV-101 | Verified email | `{"verified": true}` | ☐ Pass ☐ Fail |
| EV-102 | Unverified email | `{"verified": false}` | ☐ Pass ☐ Fail |
| EV-103 | Non-existent email | 404 "No account found" | ☐ Pass ☐ Fail |
| EV-104 | Missing email param | 400 "Missing email address" | ☐ Pass ☐ Fail |

### 6.3 Resend Verification Email

**Test Steps:**
1. Login with unverified account
2. See "Email Not Verified" page
3. Enter email and click "Resend Verification Email"

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| EV-201 | Click "Resend" first time | Email sent successfully | ☐ Pass ☐ Fail |
| EV-202 | Click "Resend" again immediately | 429 Error: "Please wait X minutes" | ☐ Pass ☐ Fail |
| EV-203 | Wait 60+ minutes, resend | Email sent successfully | ☐ Pass ☐ Fail |
| EV-204 | Already verified email | 400 "Email is already verified" | ☐ Pass ☐ Fail |

**API Test - Rate Limiting:**
```bash
# First request (should succeed)
curl -X POST http://localhost:7000/api/verification/resend \
  -H "Content-Type: application/json" \
  -d '{"email": "unverified@example.com"}'

# Second request within 1 hour (should fail)
curl -X POST http://localhost:7000/api/verification/resend \
  -H "Content-Type: application/json" \
  -d '{"email": "unverified@example.com"}'

# Expected: 429 Too Many Requests
```

---

## Test Case 7: MFA Authentication (OTP & Authenticator)

### 7.1 Enable MFA (CRITICAL SECURITY FIX)

**Test Steps:**
1. Login to the application
2. Navigate to User Profile
3. Find "Two-Factor Authentication" toggle
4. Enable MFA

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| MFA-001 | Toggle MFA ON (authenticated) | ✅ Success notification appears | ☐ Pass ☐ Fail |
| MFA-002 | Check Auth0 user metadata | `mfa_enabled: true` in Auth0 dashboard | ☐ Pass ☐ Fail |
| MFA-003 | Toggle MFA OFF (authenticated) | ✅ MFA disabled successfully | ☐ Pass ☐ Fail |

### 7.2 MFA Security - Authorization Test (CRITICAL)

**Test the security fix - Ensure users can't modify other users' MFA:**

**Setup:**
1. Get JWT token for User A (your account)
2. Get Auth0 ID for User B (different account)
3. Try to enable MFA for User B using User A's token

```bash
# Get your JWT token from browser DevTools:
# 1. Login to app
# 2. Open DevTools → Application → Local Storage → Access Token
# Or check Network tab → any API request → Authorization header

# Try to enable MFA for ANOTHER user (should fail)
curl -X POST http://localhost:7000/api/mfa/enable \
  -H "Authorization: Bearer YOUR_USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "auth0|DIFFERENT_USER_ID_HERE"
  }'

# Expected: 403 Forbidden
# "Unauthorized: Cannot modify another user's MFA settings"
```

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| MFA-101 | User A modifies own MFA | ✅ 200 Success | ☐ Pass ☐ Fail |
| MFA-102 | User A tries to modify User B's MFA | ❌ 403 Forbidden | ☐ Pass ☐ Fail |
| MFA-103 | Request without JWT token | ❌ 401 Unauthorized | ☐ Pass ☐ Fail |
| MFA-104 | Request with invalid JWT | ❌ 401 Unauthorized | ☐ Pass ☐ Fail |

**Test without authentication (should fail):**
```bash
# No Authorization header
curl -X POST http://localhost:7000/api/mfa/enable \
  -H "Content-Type: application/json" \
  -d '{"userId": "auth0|123456"}'

# Expected: 401 Unauthorized (JWT middleware blocks it)
```

### 7.3 MFA Login Flow

**Test Steps:**
1. Enable MFA in user profile
2. Logout completely
3. Login again
4. Auth0 should prompt for MFA setup

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| MFA-201 | First login after enabling | Auth0 shows MFA enrollment screen | ☐ Pass ☐ Fail |
| MFA-202 | Scan QR code with authenticator app | QR code scans successfully | ☐ Pass ☐ Fail |
| MFA-203 | Enter 6-digit code | Code accepted, MFA enrolled | ☐ Pass ☐ Fail |
| MFA-204 | Subsequent logins | Prompts for 6-digit code | ☐ Pass ☐ Fail |
| MFA-205 | Wrong MFA code | Login fails, error shown | ☐ Pass ☐ Fail |
| MFA-206 | Correct MFA code | Login successful | ☐ Pass ☐ Fail |

### 7.4 MFA Types Supported

Test with different authenticator apps:

| App | Test Status |
|-----|-------------|
| Google Authenticator | ☐ Pass ☐ Fail |
| Microsoft Authenticator | ☐ Pass ☐ Fail |
| Authy | ☐ Pass ☐ Fail |
| Auth0 Guardian (Push) | ☐ Pass ☐ Fail |

---

## Environment Variables Verification

### Backend Environment Check

Run this script to verify all required environment variables:

```bash
cd backend

# Check if all required env vars are set
node -e "
const required = [
  'MONGODB_CONNECTION_STRING',
  'AUTH0_AUDIENCE',
  'AUTH0_ISSUER_BASE_URL',
  'AUTH0_DOMAIN',
  'AUTH0_M2M_CLIENT_ID',
  'AUTH0_M2M_CLIENT_SECRET',
  'AUTH0_MANAGEMENT_API_AUDIENCE',
  'RECAPTCHA_SECRET_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

require('dotenv').config();
let missing = [];
required.forEach(key => {
  if (!process.env[key] || process.env[key].includes('YOUR_') || process.env[key].includes('...')) {
    missing.push(key);
  }
});

if (missing.length > 0) {
  console.log('❌ MISSING or PLACEHOLDER:', missing.join(', '));
  process.exit(1);
} else {
  console.log('✅ All environment variables configured!');
}
"
```

**Expected Result:** ✅ All environment variables configured!

---

## Integration Testing Scenarios

### Scenario 1: Complete New User Flow

**Steps:**
1. ☐ Navigate to homepage
2. ☐ Click "Login"
3. ☐ Click "Sign Up"
4. ☐ Fill Auth0 registration form (reCAPTCHA should trigger)
5. ☐ Submit registration
6. ☐ Check email for verification link
7. ☐ Click verification link
8. ☐ Login with verified account
9. ☐ Complete user profile (test validation)
10. ☐ Enable MFA
11. ☐ Logout
12. ☐ Login again (should prompt for MFA setup)
13. ☐ Complete MFA enrollment
14. ☐ Test accessing privacy policy

**Overall Status:** ☐ Pass ☐ Fail

### Scenario 2: Security Attack Simulation

**Test unauthorized access attempts:**

1. ☐ Try to access MFA endpoint without auth token → Should fail
2. ☐ Try to modify another user's MFA → Should fail
3. ☐ Try to create user without reCAPTCHA → Should fail
4. ☐ Try SQL injection in input fields → Should be sanitized
5. ☐ Try XSS in input fields → Should be escaped
6. ☐ Attempt brute force login → Should be blocked after 10 attempts

**Overall Status:** ☐ Pass ☐ Fail

---

## Test Results Summary

### Features Status

| Feature | Status | Critical Issues | Notes |
|---------|--------|-----------------|-------|
| ☐ Input Validation | ☐ Pass ☐ Fail | | |
| ☐ Google reCAPTCHA | ☐ Pass ☐ Fail | | |
| ☐ Login Limiting | ☐ Pass ☐ Fail | | |
| ☐ Privacy Policy | ☐ Pass ☐ Fail | | |
| ☐ Forgot Password | ☐ Pass ☐ Fail | | |
| ☐ Email Verification | ☐ Pass ☐ Fail | | |
| ☐ MFA Authentication | ☐ Pass ☐ Fail | | |

### Issues Found During Testing

1. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
2. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
3. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Recommendations

1. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
2. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
3. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Quick Testing Checklist

Use this for rapid testing:

**1 Minute Quick Test:**
- ☐ Backend running on :7000
- ☐ Frontend running on :5173
- ☐ Can load homepage
- ☐ Can login
- ☐ Privacy policy loads

**5 Minute Smoke Test:**
- ☐ All of above
- ☐ User profile validation works
- ☐ MFA toggle works (with auth)
- ☐ Email verification endpoint responds
- ☐ Product validation active

**15 Minute Full Test:**
- ☐ All of above
- ☐ Complete new user registration flow
- ☐ MFA security test (unauthorized access blocked)
- ☐ reCAPTCHA verification
- ☐ Rate limiting on email verification

---

## Troubleshooting Guide

### Common Issues

**Issue: "Missing reCAPTCHA token" error**
- ✅ Verify frontend is sending token in request body
- ✅ Check browser console for reCAPTCHA errors
- ✅ Verify RECAPTCHA_SECRET_KEY is set in backend .env

**Issue: MFA toggle doesn't work**
- ✅ Check browser DevTools → Network → Check Authorization header
- ✅ Verify JWT token is valid
- ✅ Check backend logs for errors
- ✅ Verify Auth0 M2M credentials are correct

**Issue: 500 Server Error on MFA routes**
- ✅ Check all AUTH0_M2M_* environment variables are set
- ✅ Verify M2M app has Management API permissions in Auth0 dashboard
- ✅ Check backend console for specific error messages

**Issue: Email verification not working**
- ✅ Check Auth0 email provider is configured
- ✅ Verify Auth0 M2M credentials
- ✅ Check spam folder
- ✅ Verify email address is correct in Auth0 dashboard

---

## Automated Testing Scripts

### Quick Backend Health Check

Create a file `test-health.sh`:

```bash
#!/bin/bash

echo "🔍 Testing Backend Health..."

# Test 1: Server is running
curl -f http://localhost:7000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Backend is running"
else
  echo "❌ Backend is not responding"
  exit 1
fi

# Test 2: Validation endpoint exists
curl -f http://localhost:7000/api/shop/search/Red > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Shop routes working"
else
  echo "⚠️  Shop routes may have issues"
fi

echo "✅ Basic health check complete"
```

Run with: `bash test-health.sh`

---

**Testing Completed By:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_
**Overall Result:** ☐ PASS ☐ FAIL
**Sign-off:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
