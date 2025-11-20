# Test Auto-Blocking Feature

## Quick Test (No Auth0 needed)

You can test the auto-blocking logic directly by calling the API endpoint 3 times:

### Step 1: Make sure backend is running

```bash
cd backend
npm run dev
```

### Step 2: Call trackFailedLogin 3 times

Open a new terminal and run these commands:

**Attempt 1:**
```bash
curl -X POST http://localhost:7000/api/security/failed-login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"p21013044@student.newinti.edu.my\",\"email\":\"p21013044@student.newinti.edu.my\",\"reason\":\"invalid_credentials\"}"
```

Expected response:
```json
{
  "message": "Failed login recorded",
  "flagged": false,
  "attemptCount": 1,
  "accountBlocked": false
}
```

**Attempt 2:**
```bash
curl -X POST http://localhost:7000/api/security/failed-login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"p21013044@student.newinti.edu.my\",\"email\":\"p21013044@student.newinti.edu.my\",\"reason\":\"invalid_credentials\"}"
```

Expected response:
```json
{
  "message": "Failed login recorded",
  "flagged": false,
  "attemptCount": 2,
  "accountBlocked": false
}
```

**Attempt 3:**
```bash
curl -X POST http://localhost:7000/api/security/failed-login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"p21013044@student.newinti.edu.my\",\"email\":\"p21013044@student.newinti.edu.my\",\"reason\":\"invalid_credentials\"}"
```

Expected response:
```json
{
  "message": "Failed login recorded",
  "flagged": true,
  "attemptCount": 3,
  "accountBlocked": true  <-- Should be TRUE!
}
```

### Step 3: Check the database

**MongoDB Compass or CLI:**

1. **Check `failedlogins` collection:**
   - Should have 3 documents
   - 3rd document should have `flagged: true`

2. **Check `users` collection:**
   - Find user with email: `p21013044@student.newinti.edu.my`
   - Should show: `isActive: false` ✅

3. **Check `securitylogs` collection:**
   - Should have 3 `failed_login` events
   - Should have 1 `account_locked` event with severity "critical"

### Step 4: Check backend console

You should see in the terminal:
```
User p21013044@student.newinti.edu.my automatically blocked due to 3 failed login attempts
```

## Expected Results

✅ After 3 attempts, database shows:
- `users.isActive = false`
- `failedlogins` has 3 records, last one flagged
- `securitylogs` has account_locked event

✅ User is also blocked in Auth0 (if Auth0 credentials are configured)

## Clean Up Test Data

To reset for another test:

```javascript
// In MongoDB
db.failedlogins.deleteMany({ email: "p21013044@student.newinti.edu.my" });
db.users.updateOne(
  { email: "p21013044@student.newinti.edu.my" },
  { $set: { isActive: true } }
);
db.securitylogs.deleteMany({ username: "p21013044@student.newinti.edu.my" });
```

## Testing with PowerShell (Windows)

If `curl` doesn't work, use PowerShell:

```powershell
$body = @{
    username = "p21013044@student.newinti.edu.my"
    email = "p21013044@student.newinti.edu.my"
    reason = "invalid_credentials"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:7000/api/security/failed-login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

Run this 3 times and check the response.

## Summary

The fix is working if:
1. ✅ 3rd attempt returns `accountBlocked: true`
2. ✅ Database shows `isActive: false`
3. ✅ Console shows "User automatically blocked" message
4. ✅ Security logs show account_locked event
