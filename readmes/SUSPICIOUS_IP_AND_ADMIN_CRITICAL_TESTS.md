# 🚨 Suspicious IP Detection & Admin Critical Scenarios Testing Guide

## Overview

This guide covers how to test:
1. **Suspicious IP Detection** - Multiple accounts logging in from the same IP
2. **Admin Critical Scenarios** - High-risk admin actions requiring audit trails

---

## 🔍 Part 1: Suspicious IP Detection

### What It Detects

The system flags IPs where **3 or more different user accounts** successfully log in from the **same IP address** within 24 hours. This can indicate:
- Account sharing/abuse
- VPN/proxy usage for fraud
- Bot networks
- Credential stuffing attacks

### Backend Logic

Located in `SecurityAnalyticsController.ts:272-299`:

```typescript
const multipleAccountsFromIP = await SecurityLog.aggregate([
  {
    $match: {
      eventType: "successful_login",
      timestamp: { $gte: twentyFourHoursAgo }
    }
  },
  {
    $group: {
      _id: "$ipAddress",
      userCount: { $addToSet: "$userId" },
      count: { $sum: 1 }
    }
  },
  {
    $match: {
      $expr: { $gte: [{ $size: "$userCount" }, 3] } // 3+ users = flagged
    }
  }
]);
```

### How to Test

#### Step 1: Ensure Backend is Running
```bash
cd backend
npm run dev
```

#### Step 2: Run Test 4.1, 4.2, 4.3 in sequence

**Test 4.1** - First user logs in:
```http
POST http://localhost:7000/api/security/successful-login
Content-Type: application/json

{
  "userId": "user_001",
  "username": "user1@test.com"
}
```
✅ Expected Response:
```json
{
  "message": "Successful login logged",
  "userId": "user_001",
  "username": "user1@test.com",
  "ipAddress": "::ffff:127.0.0.1"
}
```

**Test 4.2** - Second user logs in (same IP):
```http
POST http://localhost:7000/api/security/successful-login
Content-Type: application/json

{
  "userId": "user_002",
  "username": "user2@test.com"
}
```

**Test 4.3** - Third user logs in (TRIGGERS DETECTION):
```http
POST http://localhost:7000/api/security/successful-login
Content-Type: application/json

{
  "userId": "user_003",
  "username": "user3@test.com"
}
```

**Test 4.4** - Optional: Fourth user (increases severity):
```http
POST http://localhost:7000/api/security/successful-login
Content-Type: application/json

{
  "userId": "user_004",
  "username": "user4@test.com"
}
```

#### Step 3: Fetch Dashboard to Verify

Run **Test 6.1**:
```http
GET http://localhost:7000/api/security/dashboard
Authorization: Bearer YOUR_TOKEN
```

Look for `multipleAccountsFromIP` in response:
```json
{
  "multipleAccountsFromIP": [
    {
      "ipAddress": "::ffff:127.0.0.1",
      "userCount": 4,
      "loginCount": 4
    }
  ]
}
```

#### Step 4: View in Dashboard UI

1. Open browser: `http://localhost:3000/admin/analytics`
2. Go to **Security** tab
3. Scroll to **Suspicious Activity Detection** section
4. Look for **Multi-Account Detection (Same IP)** section
5. You should see:
   - **Red box** with IP address
   - "**4 different accounts | 4 total logins**"
   - Warning: "⚠️ Potential account abuse - Multiple users sharing same IP"
6. **Click on the entry** to see detailed modal with:
   - IP address
   - User count
   - Login count
   - Recommended actions

---

## ⚠️ Part 2: Admin Critical Scenarios

### What Are Critical Admin Actions?

These are high-risk administrative operations that should always be audited:

| Action Type | Risk Level | Why It's Critical |
|-------------|------------|-------------------|
| `bulk_operation` | 🔴 Critical | Mass changes affect many users/records |
| `data_export` | 🔴 Critical | Potential PII/sensitive data breach |
| `security_settings_changed` | 🔴 Critical | Weakens security posture |
| `user_deleted` | 🟠 High | Irreversible data loss |

### Backend Action Types

From `adminAction.ts:29-40`, all allowed action types:
```typescript
enum: [
  "product_added",
  "product_edited",
  "product_deleted",
  "order_status_changed",
  "user_role_changed",
  "settings_modified",
  "bulk_operation",        // ← Critical
  "data_export",           // ← Critical
  "user_deleted",          // ← Critical
  "security_settings_changed" // ← Critical
]
```

### How to Test Critical Actions

**IMPORTANT:** You need a valid JWT token for these tests. See [GET_JWT_TOKEN_GUIDE.md](GET_JWT_TOKEN_GUIDE.md).

#### Test 5.1: Bulk User Deletion

**Scenario:** Admin deletes 150 user accounts in one operation

```http
POST http://localhost:7000/api/security/admin-action
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "adminId": "000000000000000000000001",
  "adminUsername": "admin@sorasneakers.com",
  "actionType": "bulk_operation",
  "targetType": "user",
  "targetId": "bulk_delete_001",
  "targetName": "Bulk User Deletion",
  "changes": {
    "operation": "delete",
    "affectedUsers": 150,
    "reason": "Compliance cleanup"
  }
}
```

✅ **Expected Response:**
```json
{
  "message": "Admin action logged",
  "actionId": "675e..."
}
```

**Dashboard Display:**
- Shows in **Admin Activity Log** section
- **Purple "SETTINGS"** badge (for bulk operations)
- Action: "Bulk Operation"
- Target: "user: Bulk User Deletion"
- **Click to see:** Full changes including 150 affected users

---

#### Test 5.2: Data Export (PII)

**Scenario:** Admin exports 5,000 customer records including PII

```http
POST http://localhost:7000/api/security/admin-action
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "adminId": "000000000000000000000001",
  "adminUsername": "admin@sorasneakers.com",
  "actionType": "data_export",
  "targetType": "system",
  "targetId": "export_001",
  "targetName": "Customer Data Export",
  "changes": {
    "exportType": "customer_data",
    "recordCount": 5000,
    "includesPII": true,
    "exportedFields": ["email", "phone", "address", "purchase_history"]
  }
}
```

**Why This Is Critical:**
- Exports 5,000 records with Personally Identifiable Information (PII)
- Potential GDPR/compliance violation if not authorized
- Creates audit trail for data breach investigations
- Modal shows exactly what data was exported

---

#### Test 5.3: Security Settings Changed

**Scenario:** Admin disables 2FA requirement for all users

```http
POST http://localhost:7000/api/security/admin-action
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "adminId": "000000000000000000000001",
  "adminUsername": "admin@sorasneakers.com",
  "actionType": "security_settings_changed",
  "targetType": "system",
  "targetId": "security_config_001",
  "targetName": "Authentication Settings Modified",
  "changes": {
    "setting": "two_factor_authentication",
    "old": "required",
    "new": "optional",
    "affectedUsers": "all"
  }
}
```

**Why This Is Critical:**
- Weakens security posture for entire platform
- Before/after comparison shows security downgrade
- Affects all users in the system
- Potential insider threat indicator

---

#### Test 5.4: User Deleted

**Scenario:** Admin permanently deletes a high-value customer account

```http
POST http://localhost:7000/api/security/admin-action
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "adminId": "000000000000000000000001",
  "adminUsername": "admin@sorasneakers.com",
  "actionType": "user_deleted",
  "targetType": "user",
  "targetId": "user_12345",
  "targetName": "john.doe@example.com",
  "changes": {
    "reason": "Account violation",
    "accountAge": "2 years",
    "totalOrders": 45,
    "lifetimeValue": 2350
  }
}
```

**Why This Is Critical:**
- Irreversible action - customer data permanently deleted
- High lifetime value ($2,350) indicates significant business impact
- Audit shows justification ("Account violation")
- Enables rollback investigation if deletion was malicious

---

## 🎯 Complete Test Flow

### Full Dashboard Population Test

Run these tests in order to populate the entire Security Analytics dashboard:

```
1. Test 1.1, 1.2, 1.3     → Failed login attempts (brute force)
2. Test 2.1, 2.2, 2.3     → Admin product management actions
3. Test 3.1, 3.2          → Suspicious purchases
4. Test 3.4               → Multiple accounts detection
5. Test 4.1, 4.2, 4.3, 4.4 → Suspicious IP detection
6. Test 5.1, 5.2, 5.3, 5.4 → Admin critical actions
7. Test 6.1               → Fetch dashboard (verify all data)
```

### Expected Dashboard After All Tests:

**Metrics Summary:**
- ✅ Failed Login Attempts: 3+
- ✅ Flagged Logins: 1+
- ✅ Flagged Transactions: 2+
- ✅ Admin Actions: 7+
- ✅ Suspicious Activities: 3+
- ✅ Blocked IPs: 1+

**Sections Populated:**
1. **Failed Login Attempts** - Shows testuser@example.com with red FLAGGED badge
2. **Admin Activity Log** - Shows 7 actions (product edits + critical operations)
3. **Suspicious Activity Detection** - Shows high-value purchases, rapid checkouts
4. **Multi-Account Detection** - Shows suspicious IP with 4 users

**All Entries Clickable:** Click any security item to view detailed modal with full audit information.

---

## 🔧 Troubleshooting

### Issue: Suspicious IP Not Showing

**Problem:** After running Tests 4.1-4.4, no suspicious IP appears

**Solutions:**
1. Check backend console - ensure no errors
2. Run Test 6.1 and verify `multipleAccountsFromIP` array is not empty
3. Ensure all 3+ tests were run from the **same machine** (same IP)
4. Wait 1-2 seconds between tests for database writes
5. If testing from localhost, IP will be `::ffff:127.0.0.1` or `127.0.0.1`

### Issue: Admin Critical Actions Not Displaying

**Problem:** Critical actions logged but not visible in dashboard

**Solutions:**
1. Verify JWT token is valid (not expired)
2. Check response - should be 201 with `actionId`
3. Refresh dashboard page (Ctrl+F5)
4. Check backend logs for validation errors
5. Ensure `actionType` exactly matches enum values

### Issue: 401 Unauthorized on Admin Tests

**Problem:** Tests 5.x returning 401 error

**Solution:** Get fresh JWT token - see [GET_JWT_TOKEN_GUIDE.md](GET_JWT_TOKEN_GUIDE.md)

---

## 📊 Visual Verification Checklist

After running all tests, verify in browser dashboard:

- [ ] **Failed Login Attempts** section shows entries with red badges
- [ ] **Admin Activity Log** shows color-coded actions (red DELETE, blue EDIT, green ADD, purple SETTINGS)
- [ ] **Suspicious Activity Detection** has orange/red warning boxes
- [ ] **Multi-Account Detection (Same IP)** shows red IP box with user/login counts
- [ ] **All items are clickable** - clicking opens detailed modal
- [ ] **Metrics cards** at top show correct counts
- [ ] **Eye icons** appear on hover for each security item

---

## 🎓 Educational Value

### Security Concepts Demonstrated:

1. **Brute Force Detection** - Track failed login patterns (Test 1.x)
2. **Admin Audit Trail** - Log privileged operations (Test 2.x, 5.x)
3. **Fraud Detection** - High-value purchases, rapid checkouts (Test 3.x)
4. **Multi-Account Abuse** - Same IP, different users (Test 4.x)
5. **Insider Threat Monitoring** - Critical admin actions (Test 5.x)
6. **Compliance Logging** - PII data exports, security changes (Test 5.2, 5.3)

### Real-World Applications:

- **E-commerce platforms** - Prevent payment fraud
- **SaaS applications** - Detect account sharing
- **Financial services** - Audit trail for compliance (SOX, GDPR, PCI-DSS)
- **Enterprise systems** - Monitor privileged user activity
- **Security Operations** - Incident response and forensics

---

## 📚 Related Documentation

- [HOW_TO_USE_REST_CLIENT.md](HOW_TO_USE_REST_CLIENT.md) - REST Client setup guide
- [GET_JWT_TOKEN_GUIDE.md](GET_JWT_TOKEN_GUIDE.md) - How to get authentication token
- [SECURITY_ANALYTICS_TEST_CASES.md](SECURITY_ANALYTICS_TEST_CASES.md) - All test scenarios
- [security-tests.http](security-tests.http) - Executable REST Client tests

---

**Happy Testing! 🔒**
