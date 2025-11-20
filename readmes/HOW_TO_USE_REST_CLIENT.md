# 🚀 How to Use VS Code REST Client for Security Testing

## Step 1: Install REST Client Extension

1. Open VS Code
2. Click Extensions icon (or press `Ctrl+Shift+X`)
3. Search for **"REST Client"** by Huachao Mao
4. Click **Install**

![REST Client Extension](https://raw.githubusercontent.com/Huachao/vscode-restclient/master/images/usage.gif)

---

## Step 2: Open the Test File

1. In VS Code, open the file: `security-tests.http`
2. You'll see all the test cases formatted with HTTP requests

---

## Step 3: Get Your JWT Token (Required for Admin Tests)

### Method 1: From Browser (Easiest)
1. Open your app in browser: `http://localhost:3000`
2. Login as admin
3. Press `F12` to open DevTools
4. Go to **Application** tab → **Local Storage** → `http://localhost:3000`
5. Look for a key like `@@auth0spajs@@::...` or `auth_token`
6. Copy the `access_token` value
7. In `security-tests.http`, replace `YOUR_JWT_TOKEN_HERE` with your token at the top:
   ```http
   @token = eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Method 2: From Network Tab
1. Login as admin
2. Open DevTools → **Network** tab
3. Look for any API request (like `/api/security/dashboard`)
4. Click on it → **Headers** tab
5. Find `Authorization: Bearer <token>`
6. Copy the token part

---

## Step 4: Run Your First Test

### Test Failed Login Detection:

1. Make sure your backend is running:
   ```bash
   cd backend
   npm run dev
   ```

2. In `security-tests.http`, scroll to **Test 1.1**
3. You'll see:
   ```http
   ### Test 1.1: First Failed Login Attempt
   POST {{baseUrl}}/api/security/failed-login
   Content-Type: application/json

   {
     "username": "testuser@example.com",
     "email": "testuser@example.com",
     "reason": "invalid_credentials"
   }
   ```

4. Click **"Send Request"** that appears above the POST line
5. Results appear in a new panel on the right

### Expected Response:
```json
{
  "message": "Failed login recorded",
  "flagged": false,
  "attemptCount": 1,
  "accountBlocked": false
}
```

---

## Step 5: Run the Brute Force Test

### Trigger Account Blocking (3 Attempts):

1. Run **Test 1.1** (First attempt) - Click "Send Request"
2. Wait for response
3. Run **Test 1.2** (Second attempt) - Click "Send Request"
4. Wait for response
5. Run **Test 1.3** (Third attempt - TRIGGERS BLOCKING) - Click "Send Request"

### Expected Result for 3rd Attempt:
```json
{
  "message": "Failed login recorded",
  "flagged": true,
  "attemptCount": 3,
  "accountBlocked": true  ← USER IS NOW BLOCKED!
}
```

---

## Step 6: Verify in Analytics Dashboard

1. Open browser: `http://localhost:3000/admin/analytics`
2. Click **Security** tab
3. You should see:
   - **Failed Login Attempts** card shows: `3`
   - **Flagged Logins** card shows: `1`
   - In **Failed Login Attempts** section:
     - Entry for `testuser@example.com`
     - Red **"FLAGGED"** badge
     - Shows 3 attempts
   - **Click on the entry** to see detailed modal with:
     - Threat level
     - IP address
     - User agent
     - Recommended security actions

---

## Step 7: Test Admin Actions

### Track Product Deletion:

1. First, get your JWT token (Step 3)
2. Update the `@token` variable at top of file
3. Scroll to **Test 2.1**
4. Click **"Send Request"**

### Expected Response:
```json
{
  "message": "Admin action logged",
  "actionId": "65f4a3..."
}
```

5. Refresh Analytics Dashboard → Security Tab
6. Check **Admin Activity Log** section
7. Should show:
   - Red "DELETE" badge
   - Admin email
   - Product name
   - **Click the entry** to see audit details

---

## Step 8: Test Suspicious Activity

### Trigger High-Value Purchase Alert:

1. Scroll to **Test 3.1**
2. Click **"Send Request"**
3. Refresh Analytics Dashboard
4. Check **Suspicious Activity Detection** section
5. Should show:
   - Red "CRITICAL" severity badge
   - Purchase amount: $850
   - Account age: 2 hours
   - **Click the alert** to see full fraud analysis

---

## Quick Reference: Running Multiple Tests

### Scenario: Populate Dashboard with Data

Run these tests in sequence (click Send Request for each):

1. **Test 1.1, 1.2, 1.3** - Create failed logins
2. **Test 1.4** (all 3 sub-tests) - Create different failed users
3. **Test 2.1, 2.2, 2.3** - Log admin actions
4. **Test 3.1, 3.2** - Create suspicious activities

Now refresh the dashboard - it's fully populated!

---

## Keyboard Shortcuts

- **Send Request**: Click "Send Request" or `Ctrl+Alt+R` (Windows) / `Cmd+Alt+R` (Mac)
- **Send All Requests**: `Ctrl+Alt+L` / `Cmd+Alt+L`
- **Cancel Request**: `Ctrl+Alt+K` / `Cmd+Alt+K`

---

## Troubleshooting

### ❌ "Failed to fetch"
**Problem:** Backend not running
**Solution:** Run `npm run dev` in backend folder

### ❌ "401 Unauthorized"
**Problem:** JWT token expired or missing
**Solution:** Get new token from browser (Step 3)

### ❌ "Connection refused"
**Problem:** Wrong URL
**Solution:** Check `@baseUrl = http://localhost:7000` is correct

### ❌ No data in dashboard
**Problem:** Tests ran but dashboard empty
**Solution:** Click the green "Use Dummy Data" button

---

## Pro Tips

### 1. Variables
You can create your own variables:
```http
@myEmail = test@example.com
@myIP = 192.168.1.100

POST {{baseUrl}}/api/security/failed-login
Content-Type: application/json

{
  "username": "{{myEmail}}",
  "ipAddress": "{{myIP}}"
}
```

### 2. Save Responses
Click the "Save Response" button in the response panel to save for later analysis

### 3. Environment Files
Create `.env` files for different environments:
- `dev.http` - localhost URLs
- `prod.http` - production URLs

---

## Expected Security Dashboard After All Tests

After running all tests, your Security Analytics Dashboard should show:

✅ **Failed Login Attempts**: 8+
✅ **Flagged Logins**: 2+
✅ **Admin Actions**: 5+
✅ **Suspicious Activities**: 2+
✅ **Suspicious IPs**: 1 (if same IP used multiple times)
✅ **All entries are clickable** with detailed modals showing:
   - Full threat assessment
   - IP addresses and user agents
   - Recommended security actions
   - Audit trail information

---

## Next Steps

1. ✅ Run Test 1-6 to populate dashboard
2. ✅ Click on each security item to view details
3. ✅ Verify auto-refresh (dashboard updates every 10 seconds)
4. ✅ Test "Use Dummy Data" button for instant population
5. ✅ Check warning banner when failed logins exceed successful logins

**Happy Testing! 🎉**

---

**Need Help?** Check the main test documentation in `SECURITY_ANALYTICS_TEST_CASES.md`
