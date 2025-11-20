# Setup Instructions for Auth0 Integration and Login Limiting

## Problem Fixed

Previously, when Auth0 blocked users for failed login attempts:
- ✅ Users saw the block message
- ❌ Database `isActive` field was NOT updated
- ❌ `failedlogins` collection had 0 records

Now the system properly syncs between Auth0 and your database!

---

## What Was Added

### 1. **Auth0 Service** (`backend/src/services/auth0Service.ts`)
- Communicates with Auth0 Management API
- Syncs failed login logs from Auth0 to database
- Blocks/unblocks users in Auth0 when admins change database status

### 2. **New API Endpoints**
- `POST /api/security/sync-auth0-logs` - Manually sync Auth0 failed logins to database
- `GET /api/admin/users/check-block-status?auth0Id=xxx` - Check if user is blocked (called by Auth0)

### 3. **Auth0 Action** (`backend/AUTH0_ACTION_LOGIN_CHECK.js`)
- Runs on every login attempt
- Checks your database before allowing login
- Blocks login if `isActive = false` in database

### 4. **Updated Admin Controls** (`backend/src/controllers/AdminUserController.ts`)
- When admin blocks user → blocks in BOTH database AND Auth0
- When admin unblocks user → unblocks in BOTH database AND Auth0

---

## Setup Steps

### Step 1: Verify Environment Variables

Your `.env` file already has the Auth0 credentials. Verify these exist:

```env
AUTH0_DOMAIN=dev-klpl8j7hgpcnoaxt.us.auth0.com
AUTH0_MANAGEMENT_CLIENT_ID=HkSvWpECpPMYTcm10IQCafd3eHU9CfES
AUTH0_MANAGEMENT_CLIENT_SECRET=ZxUh8kLFk00L2kOdil9ww7oHolcWo0SdU-5op1MW8InPDFGI-bnzaksrPb2vhI2z
```

✅ **Already configured - no action needed!**

---

### Step 2: Install Auth0 Action (IMPORTANT!)

This is the key step that makes database blocking work with Auth0.

#### Instructions:

1. **Go to Auth0 Dashboard**: https://manage.auth0.com/

2. **Navigate to**: Actions > Library

3. **Click**: "Build Custom" button

4. **Configure the Action**:
   - **Name**: `Check Database Block Status`
   - **Trigger**: Select `Login / Post Login`
   - **Runtime**: `Node 18` (or latest)

5. **Copy the code** from `backend/AUTH0_ACTION_LOGIN_CHECK.js` into the editor

6. **Add Secret**:
   - Click "Secrets" tab (lock icon on left sidebar)
   - Click "Add Secret"
   - Key: `API_BASE_URL`
   - Value: `http://localhost:7000` (for development)
   - For production: Use your actual API URL (e.g., `https://api.yoursite.com`)

7. **Click "Deploy"** (top right button)

8. **Add to Login Flow**:
   - Go to: Actions > Flows > Login
   - Find your deployed action in the right sidebar
   - **Drag it** into the flow (between "Start" and "Complete")
   - **Click "Apply"** (top right)

✅ **Done!** Now every login checks your database first.

---

### Step 3: Test the Integration

#### Test 1: Manual Sync Failed Logins

Test that Auth0 logs can be imported to your database:

```bash
# Make sure your backend is running
cd backend
npm run dev

# In another terminal, call the sync endpoint (as admin)
curl -X POST http://localhost:7000/api/security/sync-auth0-logs \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Expected Result**: Any failed logins from Auth0 in the last 24 hours will appear in your `failedlogins` collection.

#### Test 2: Block User and Test Login

1. **Block a test user** via admin panel or API:
   ```bash
   curl -X PUT http://localhost:7000/api/admin/users/{userId}/deactivate \
     -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
   ```

2. **Verify in MongoDB**:
   - `users` collection: `isActive: false` ✅
   - Auth0 Dashboard > User Management > Users: User should show "Blocked" status ✅

3. **Try to login** with that user's credentials

**Expected Result**: Login should be denied with message: "Your account has been blocked. Please contact support."

#### Test 3: Unblock User

1. **Unblock the user** via admin panel or API:
   ```bash
   curl -X PUT http://localhost:7000/api/admin/users/{userId}/activate \
     -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
   ```

2. **Verify in MongoDB**:
   - `users` collection: `isActive: true` ✅
   - Auth0 Dashboard: User should show "Active" status ✅

3. **Try to login** again

**Expected Result**: Login should succeed! ✅

---

## How It Works Now

### Scenario 1: User Enters Wrong Password 3 Times

**Before (What You Saw)**:
- Auth0 shows block message ✅
- Database shows `isActive: true` ❌
- `failedlogins` collection: 0 records ❌

**After (With Fix)**:
1. User enters wrong password on Auth0 login page
2. Auth0's Attack Protection triggers after 3 attempts
3. Auth0 blocks the account
4. Admin runs sync: `POST /api/security/sync-auth0-logs`
5. System fetches Auth0 logs and creates `failedlogins` records ✅
6. Each record shows:
   - Username/email
   - IP address
   - User agent
   - Timestamp
   - Flagged status (if 3+ attempts)

### Scenario 2: Admin Blocks User in Database

**Flow**:
1. Admin clicks "Deactivate" in User Management page
2. Backend sets `user.isActive = false` in database ✅
3. Backend calls Auth0 API to block user in Auth0 ✅
4. User tries to login
5. Auth0 Action runs: checks database via `/check-block-status`
6. Database returns `isBlocked: true`
7. Auth0 denies login with message ✅

**Result**: Both Auth0 and database are in sync! ✅

---

## Automatic Syncing (Optional Enhancement)

To automatically sync Auth0 logs every hour, add this cron job:

```typescript
// backend/src/cron/syncAuth0Logs.ts
import cron from 'node-cron';
import { syncAuth0FailedLogins } from '../services/auth0Service';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Starting Auth0 log sync...');
  try {
    await syncAuth0FailedLogins();
    console.log('Auth0 log sync completed successfully');
  } catch (error) {
    console.error('Auth0 log sync failed:', error);
  }
});
```

Then install the package:
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

---

## Troubleshooting

### Issue: "Failed to get Auth0 management token"

**Solution**:
1. Check your `.env` file has correct values
2. Verify Auth0 Management API credentials:
   - Go to Auth0 Dashboard > Applications > Applications
   - Find your Machine-to-Machine app
   - Copy Client ID and Client Secret
   - Update `.env` file

### Issue: "Auth0 Action not blocking users"

**Solution**:
1. Verify the Action is deployed (check Auth0 Dashboard)
2. Ensure it's added to Login Flow (Actions > Flows > Login)
3. Check the Secret `API_BASE_URL` is set correctly
4. Test the endpoint manually:
   ```bash
   curl "http://localhost:7000/api/admin/users/check-block-status?auth0Id=auth0|123456"
   ```

### Issue: "Sync endpoint returns 500 error"

**Solution**:
1. Check Auth0 credentials in `.env`
2. Verify your Auth0 Management API has permissions:
   - Go to Auth0 Dashboard > Applications > APIs
   - Click "Auth0 Management API"
   - Ensure these scopes are authorized:
     - `read:users`
     - `read:logs`
     - `update:users`

---

## Security Improvements

This implementation provides:

✅ **Centralized blocking** - Block in database = block everywhere
✅ **Audit trail** - All failed logins tracked in MongoDB
✅ **Real-time enforcement** - Auth0 checks database on every login
✅ **Admin control** - Admins can block/unblock from your app
✅ **Failed login detection** - 3-strike rule with automatic flagging
✅ **IP tracking** - See which IPs are attempting logins
✅ **Sync flexibility** - Manual or automatic Auth0 log syncing

---

## Next Steps

1. ✅ Set up Auth0 Action (Step 2)
2. ✅ Test blocking/unblocking flow
3. ✅ Run manual sync to populate existing failed logins
4. 📊 Monitor security dashboard for flagged attempts
5. 🔄 (Optional) Set up automatic hourly sync

---

## API Reference

### Sync Auth0 Logs
```http
POST /api/security/sync-auth0-logs
Authorization: Bearer {admin_token}
```

### Check Block Status (Called by Auth0)
```http
GET /api/admin/users/check-block-status?auth0Id={auth0Id}
```

### Block User
```http
PUT /api/admin/users/{userId}/deactivate
Authorization: Bearer {admin_token}
```

### Unblock User
```http
PUT /api/admin/users/{userId}/activate
Authorization: Bearer {admin_token}
```

---

Need help? Check the console logs or Auth0 Dashboard Real-time Logs (Monitoring > Logs) to debug issues.
