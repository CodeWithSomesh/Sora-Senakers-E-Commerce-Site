# Security Analytics Dashboard - Test Cases & User Guide

## Overview
This document provides comprehensive test cases for all security features in the Analytics Dashboard. Each test case includes step-by-step instructions to recreate security scenarios and verify the system's detection capabilities.

---

## 1. Failed Login Attempts Detection & Account Blocking

### Security Feature
Automatically detects and flags accounts with 3+ failed login attempts within 24 hours. Users are automatically blocked after reaching this threshold.

### Test Case 1.1: Trigger Failed Login Detection (Brute Force Simulation)
**Objective:** Test the system's ability to detect and flag brute-force attack attempts

**Prerequisites:**
- Have a test user account ready
- Know the email address of the test account
- Backend server running on `http://localhost:7000`

**Steps to Recreate:**

1. **Attempt 1st Failed Login:**
   ```bash
   curl -X POST http://localhost:7000/api/security/failed-login \
   -H "Content-Type: application/json" \
   -d '{
     "username": "testuser@example.com",
     "email": "testuser@example.com",
     "reason": "invalid_credentials"
   }'
   ```
   **Expected Result:** Response shows `attemptCount: 1`, `flagged: false`

2. **Attempt 2nd Failed Login:**
   ```bash
   curl -X POST http://localhost:7000/api/security/failed-login \
   -H "Content-Type: application/json" \
   -d '{
     "username": "testuser@example.com",
     "email": "testuser@example.com",
     "reason": "invalid_credentials"
   }'
   ```
   **Expected Result:** Response shows `attemptCount: 2`, `flagged: false`

3. **Attempt 3rd Failed Login (Trigger Point):**
   ```bash
   curl -X POST http://localhost:7000/api/security/failed-login \
   -H "Content-Type: application/json" \
   -d '{
     "username": "testuser@example.com",
     "email": "testuser@example.com",
     "reason": "invalid_credentials"
   }'
   ```
   **Expected Result:**
   - Response shows `attemptCount: 3`, `flagged: true`, `accountBlocked: true`
   - User account is automatically blocked in database
   - User account is blocked in Auth0

4. **Verify in Analytics Dashboard:**
   - Navigate to Admin Panel → Analytics → Security Tab
   - Check "Failed Login Attempts" card: Should show count increased
   - Check "Flagged Logins" metric: Should show 1 or more
   - Scroll to "Failed Login Attempts" section
   - Find the entry for "testuser@example.com"
   - Verify it shows:
     - Red "FLAGGED" badge
     - Attempt count of 3+
     - IP address recorded
     - Timestamp
     - Reason: "invalid_credentials"

**Verification Checklist:**
- [ ] Failed login count increases in metrics card
- [ ] Flagged login count increases when 3+ attempts reached
- [ ] Red "FLAGGED" badge appears on the failed login entry
- [ ] User account is blocked and cannot login
- [ ] IP address is captured
- [ ] Timestamp is accurate

### Test Case 1.2: Verify Database Storage
**Steps:**
1. Open MongoDB Compass or mongosh
2. Query the `failedlogins` collection:
   ```javascript
   db.failedlogins.find({ email: "testuser@example.com" }).sort({ timestamp: -1 })
   ```
3. Verify the documents show:
   - `flagged: true` for the 3rd attempt
   - `attemptCount: 3`
   - `ipAddress` is populated
   - `userAgent` is populated

---

## 2. Admin Activity Log

### Security Feature
Tracks all administrative actions (product add/edit/delete, user management) for audit compliance and accountability.

### Test Case 2.1: Track Product Deletion
**Objective:** Verify admin actions are logged when products are deleted

**Steps to Recreate:**

1. **Login as Admin:**
   - Navigate to login page
   - Login with admin credentials

2. **Delete a Product:**
   - Go to Admin Panel → Manage Products
   - Find any product in the list
   - Click the trash icon to delete
   - Confirm deletion

3. **Manually Track Action (Alternative Method):**
   ```bash
   curl -X POST http://localhost:7000/api/security/admin-action \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
   -d '{
     "adminId": "admin123",
     "adminUsername": "admin@sorasneakers.com",
     "actionType": "product_delete",
     "targetType": "product",
     "targetId": "prod_12345",
     "targetName": "Nike Air Max 2024"
   }'
   ```

4. **Verify in Analytics Dashboard:**
   - Navigate to Admin Panel → Analytics → Security Tab
   - Check "Admin Actions" card: Should show count increased
   - Scroll to "Admin Activity Log" section
   - Verify the entry shows:
     - Admin email
     - Action type with red "DELETE" badge
     - Product name
     - Timestamp

**Verification Checklist:**
- [ ] Admin action count increases
- [ ] New entry appears in Admin Activity Log
- [ ] Entry shows correct admin email
- [ ] Action type is color-coded (Red for DELETE)
- [ ] Target product name is displayed
- [ ] Timestamp is accurate

### Test Case 2.2: Track Product Edit
**Steps:**
1. Go to Admin Panel → Manage Products
2. Click edit (pencil icon) on any product
3. Change product price or name
4. Save changes
5. Check Analytics Dashboard → Security Tab → Admin Activity Log
6. Verify yellow "EDIT" badge appears with product name

### Test Case 2.3: Track Product Addition
**Steps:**
1. Go to Admin Panel → Add Products
2. Fill in all product details
3. Upload image
4. Click "Add Product"
5. Check Analytics Dashboard → Security Tab → Admin Activity Log
6. Verify green "ADD" badge appears with new product name

---

## 3. Suspicious Activity Detection

### Security Feature
Identifies potential fraud patterns including high-value purchases from new accounts, rapid checkouts, and multi-account abuse from same IP.

### Test Case 3.1: High-Value Purchase Detection
**Objective:** Test detection of suspicious large purchases from newly created accounts

**Steps to Recreate:**

1. **Simulate High-Value Purchase:**
   ```bash
   curl -X POST http://localhost:7000/api/security/suspicious-activity \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
   -d '{
     "type": "high_value_purchase",
     "userId": "user_new_account",
     "username": "newuser@test.com",
     "details": {
       "purchaseAmount": 850,
       "accountAge": 2,
       "accountAgeUnit": "hours"
     }
   }'
   ```

2. **Verify in Analytics Dashboard:**
   - Navigate to Admin Panel → Analytics → Security Tab
   - Check "Suspicious Activities" metric card
   - Scroll to "Suspicious Activity Detection" section
   - Verify the entry shows:
     - Red "CRITICAL" severity badge
     - Event type: "high_value_purchase"
     - Username: "newuser@test.com"
     - Purchase amount: $850
     - Account age: 2 hours
     - IP address

**Expected Result:**
- Suspicious activity count increases
- Critical severity warning appears
- Entry is logged with full details

### Test Case 3.2: Rapid Checkout Detection
**Steps:**
1. Use the API to simulate rapid checkout:
   ```bash
   curl -X POST http://localhost:7000/api/security/suspicious-activity \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
   -d '{
     "type": "rapid_checkout",
     "username": "suspicious@example.com",
     "details": {
       "checkoutInterval": 15,
       "intervalUnit": "seconds"
     }
   }'
   ```
2. Check Analytics Dashboard
3. Verify "MEDIUM" or "HIGH" severity badge appears
4. Verify checkout interval is displayed (15 seconds)

### Test Case 3.3: Multiple Accounts from Same IP
**Objective:** Detect account abuse where multiple users login from same IP address

**Steps to Recreate:**

1. **Create Multiple Test Accounts** (or use existing ones)
   - Account 1: user1@test.com
   - Account 2: user2@test.com
   - Account 3: user3@test.com

2. **Login from Same IP (Simulated):**
   The system automatically tracks this when users login. To simulate:
   - Login as user1@test.com from your browser
   - Logout
   - Login as user2@test.com from same browser/IP
   - Logout
   - Login as user3@test.com from same browser/IP

3. **Verify in Analytics Dashboard:**
   - Navigate to Security Tab
   - Scroll to "Suspicious Activity Detection" section
   - Look for "Security Warnings" subsection
   - Verify warning shows:
     - IP address
     - Number of different accounts (3+)
     - Number of total logins

**Expected Result:**
- "Suspicious IPs" metric increases
- Warning appears in Suspicious Activity section
- Shows IP, user count, and login count

---

## 4. Login Analysis (Success vs Failed)

### Security Feature
Compares successful vs failed login attempts to identify potential security threats. Alerts when failed logins exceed successful ones.

### Test Case 4.1: Trigger Security Warning
**Objective:** Generate more failed logins than successful to trigger warning

**Steps to Recreate:**

1. **Create Multiple Failed Logins** (use different accounts to avoid blocking):
   ```bash
   # Failed login 1
   curl -X POST http://localhost:7000/api/security/failed-login \
   -H "Content-Type: application/json" \
   -d '{"username": "user1@test.com", "reason": "invalid_credentials"}'

   # Failed login 2
   curl -X POST http://localhost:7000/api/security/failed-login \
   -H "Content-Type: application/json" \
   -d '{"username": "user2@test.com", "reason": "invalid_credentials"}'

   # Failed login 3
   curl -X POST http://localhost:7000/api/security/failed-login \
   -H "Content-Type: application/json" \
   -d '{"username": "user3@test.com", "reason": "invalid_credentials"}'
   ```

2. **Create Fewer Successful Logins:**
   - Login successfully as admin (1 successful login)
   - Logout
   - (Now you have 3 failed vs 1 successful)

3. **Verify in Analytics Dashboard:**
   - Navigate to Security Tab
   - Scroll to "Login Attempts Analysis" section
   - Verify:
     - Green box shows "Successful Logins" count (e.g., 1)
     - Red box shows "Failed Logins" count (e.g., 3)
     - **RED WARNING BANNER** appears with text:
       "⚠️ Warning: Failed logins exceed successful logins - potential security threat!"

**Expected Result:**
- Warning banner appears when failed > successful
- Numbers accurately reflect today's login attempts
- Warning message is clearly visible

---

## 5. Auto-Refresh Functionality

### Test Case 5.1: Verify 10-Second Auto-Refresh
**Steps:**
1. Navigate to Analytics → Security Tab
2. Note the "Last updated" timestamp at top
3. Wait 10 seconds without interacting
4. Observe the timestamp updates automatically
5. Check if new security events appear automatically

**Expected Result:**
- Dashboard refreshes every 10 seconds
- New data loads without manual refresh
- Timestamp updates

---

## 6. Dummy Data Mode

### Test Case 6.1: Load Demo Data
**Objective:** Test the dummy data feature for demonstration purposes

**Steps:**
1. Navigate to Analytics Dashboard
2. Click the green "Use Dummy Data" button (top right)
3. Verify all sections populate with sample data:
   - Metrics cards show numbers (8 failed logins, 2 flagged, etc.)
   - Failed Login Attempts section shows 3 sample entries
   - Admin Activity Log shows 5 sample entries
   - Suspicious Activity shows 2 sample entries
   - Login comparison shows data

**Expected Result:**
- Realistic sample data appears instantly
- Button disappears after click
- All dashboard sections are populated

---

## 7. Integration Test: Complete Security Flow

### Test Case 7.1: End-to-End Security Monitoring
**Objective:** Test complete security monitoring workflow

**Steps:**
1. **Generate Failed Logins:** Create 3 failed login attempts (test brute-force)
2. **Perform Admin Action:** Delete a product as admin
3. **Trigger Suspicious Activity:** Simulate high-value purchase
4. **View Dashboard:** Navigate to Analytics → Security Tab
5. **Verify All Features:**
   - Metrics cards show correct counts
   - Failed Login section shows flagged entry
   - Admin Activity Log shows delete action
   - Suspicious Activity shows high-value purchase
   - Login comparison is accurate

**Expected Result:**
- All security events are tracked
- Dashboard displays complete security overview
- Metrics are accurate
- No errors in console

---

## Quick Test Checklist

Use this checklist for rapid verification:

**Failed Login Detection:**
- [ ] 3 failed attempts trigger flagging
- [ ] Account is automatically blocked
- [ ] Red "FLAGGED" badge appears
- [ ] IP address is captured

**Admin Activity Logging:**
- [ ] Product deletion is logged
- [ ] Product edit is logged
- [ ] Admin email is displayed
- [ ] Color-coded action badges work

**Suspicious Activity:**
- [ ] High-value purchases are flagged
- [ ] Severity levels are correct
- [ ] IP addresses are captured
- [ ] Details are displayed

**Login Analysis:**
- [ ] Success/failed counts are accurate
- [ ] Warning appears when failed > successful
- [ ] Data updates in real-time

**Dashboard Features:**
- [ ] Auto-refresh works (10 seconds)
- [ ] Dummy data button populates dashboard
- [ ] Last updated timestamp is accurate
- [ ] All metrics cards display correctly

---

## Troubleshooting

### No Data Appearing:
1. Click "Use Dummy Data" button to load sample data
2. Ensure backend server is running (`npm run dev`)
3. Check browser console for errors
4. Verify JWT token is valid (login again if needed)

### Failed Login Not Flagging:
1. Ensure 3 attempts are made with same email/username
2. Attempts must be within 24 hours
3. Check MongoDB for `failedlogins` collection

### Admin Actions Not Logging:
1. Ensure you're logged in as admin
2. Check network tab for API calls
3. Verify JWT token is included in request

---

## API Endpoints Reference

**Track Failed Login:**
```
POST /api/security/failed-login
Body: { username, email, reason }
```

**Track Admin Action:**
```
POST /api/security/admin-action
Headers: Authorization: Bearer {token}
Body: { adminId, adminUsername, actionType, targetType, targetId, targetName }
```

**Detect Suspicious Activity:**
```
POST /api/security/suspicious-activity
Headers: Authorization: Bearer {token}
Body: { type, userId, username, details }
```

**Get Security Dashboard:**
```
GET /api/security/dashboard
Headers: Authorization: Bearer {token}
```

---

## Expected Security Benefits Demonstrated

1. **Brute-Force Protection:** Auto-blocking after 3 failed attempts
2. **Audit Compliance:** Complete trail of admin actions
3. **Fraud Detection:** Identification of suspicious purchase patterns
4. **Real-Time Monitoring:** 10-second auto-refresh
5. **Threat Intelligence:** Multiple accounts from same IP detection
6. **Incident Response:** Clear visualization of security events

---

**Document Version:** 1.0
**Last Updated:** 2025-11-20
**Author:** Security Analytics Team
