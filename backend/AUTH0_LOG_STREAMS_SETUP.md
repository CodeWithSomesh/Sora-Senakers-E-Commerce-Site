# Auth0 Log Streams Setup - Automatic Failed Login Tracking

## The Problem

Auth0 handles login on their servers. When someone enters a wrong password:
1. Auth0 validates credentials on their side
2. Auth0 shows error on their login page
3. **Your backend never knows about it**
4. After 10 failed attempts, Auth0 blocks the user
5. Your database `isBlocked` stays `false` (not synced)

## The Solution: Auth0 Log Streams

Auth0 Log Streams can send events (including failed logins) to your backend in real-time.

---

## Option 1: Use Webhook Log Stream (RECOMMENDED)

### Step 1: Create Webhook Endpoint in Your Backend

This endpoint receives Auth0 log events:

**File: `backend/src/routes/Auth0WebhookRoute.ts`**

```typescript
import express from "express";
import { Request, Response } from "express";
import User from "../models/user";
import FailedLogin from "../models/failedLogin";
import { blockAuth0User } from "../services/auth0Service";

const router = express.Router();

// Webhook endpoint to receive Auth0 logs
router.post("/auth0-logs", async (req: Request, res: Response) => {
  try {
    const logs = req.body;

    // Auth0 sends an array of log events
    for (const log of logs) {
      // Check if this is a failed login event
      if (log.type === 'f' || log.type === 'fp' || log.type === 'fu') {
        // 'f' = Failed login
        // 'fp' = Failed login (wrong password)
        // 'fu' = Failed login (invalid username)

        const username = log.user_name || log.user_email || 'unknown';
        const ipAddress = log.ip || 'unknown';
        const userAgent = log.user_agent || 'unknown';

        // Call the existing trackFailedLogin logic
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentAttempts = await FailedLogin.countDocuments({
          username,
          timestamp: { $gte: twentyFourHoursAgo }
        });

        const shouldFlag = recentAttempts >= 2; // This will be the 3rd attempt

        // Create failed login record
        await FailedLogin.create({
          username,
          email: username,
          ipAddress,
          userAgent,
          attemptCount: recentAttempts + 1,
          timestamp: new Date(log.date),
          reason: log.type === 'fu' ? 'account_not_found' : 'invalid_credentials',
          flagged: shouldFlag,
        });

        // If 3 or more attempts, block the user
        if (shouldFlag) {
          const user = await User.findOne({ email: username });

          if (user && !user.isBlocked) {
            user.isBlocked = true;
            await user.save();

            // Also block in Auth0
            try {
              await blockAuth0User(user.auth0Id);
            } catch (error) {
              console.error('Failed to block user in Auth0:', error);
            }

            console.log(`User ${username} automatically blocked after 3 failed attempts`);
          }
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Auth0 webhook error:', error);
    res.status(500).send('Error processing logs');
  }
});

export default router;
```

### Step 2: Register the Route

**File: `backend/src/index.ts`**

Add to your route registration:
```typescript
import auth0WebhookRoute from "./routes/Auth0WebhookRoute";

app.use("/api/webhooks", auth0WebhookRoute);
```

### Step 3: Setup Log Stream in Auth0

1. **Go to Auth0 Dashboard**: https://manage.auth0.com/
2. **Navigate to**: Monitoring > Streams
3. **Click**: "Create Log Stream"
4. **Select**: "Custom Webhook"
5. **Configure**:
   - **Name**: "Failed Login Tracker"
   - **Payload URL**: `http://localhost:7000/api/webhooks/auth0-logs`
   - For production: `https://your-domain.com/api/webhooks/auth0-logs`
   - **Content Type**: `application/json`
   - **Authorization**: Leave empty (we'll handle this in code if needed)
6. **Filter Events**: Select these event types:
   - ✅ Failed Login (f)
   - ✅ Failed Login (Invalid Password) (fp)
   - ✅ Failed Login (Invalid Username) (fu)
   - ✅ Blocked Account (limit_wc)
7. **Click**: "Save"

### Step 4: Test the Webhook

1. Use the Auth0 dashboard to send a test event
2. Check your backend logs for incoming webhook data
3. Try logging in with wrong password 3 times
4. Check your database - user should have `isBlocked: true`

---

## Option 2: Periodic Sync (SIMPLER but Less Real-Time)

If webhooks are too complex, use periodic syncing:

### Setup Automatic Sync Every 5 Minutes

**File: `backend/src/cron/syncAuth0.ts`**

```typescript
import cron from 'node-cron';
import { syncAuth0FailedLogins } from '../services/auth0Service';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running Auth0 failed login sync...');

  try {
    await syncAuth0FailedLogins();
    console.log('Successfully synced failed logins from Auth0');
  } catch (error) {
    console.error('Failed to sync Auth0 logs:', error);
  }
});

export default {};
```

**Install node-cron:**
```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

**Import in `backend/src/index.ts`:**
```typescript
import './cron/syncAuth0';  // Add this line
```

**Pros**: Simple to set up
**Cons**: Up to 5 minute delay before blocking takes effect

---

## Option 3: Manual Sync Button (Already Implemented)

You already have this! Just need to call it regularly.

**Endpoint**: `POST /api/security/sync-auth0-logs`

**How to use**:
1. Admin goes to Security Dashboard
2. Clicks "Sync Auth0 Logs" button
3. System imports failed logins and blocks users with 3+ attempts

---

## Recommended Approach

**For Development/Testing:**
- Use **Option 3** (Manual Sync) - Already works!
- Call the sync endpoint after you see Auth0 block message
- Check database to verify `isBlocked = true`

**For Production:**
- Use **Option 1** (Webhook Log Stream) - Real-time, automatic
- Or use **Option 2** (5-minute cron) - Simpler, slightly delayed

---

## Quick Fix: Add Sync Button to Frontend

If you want a quick solution, add this button to your admin dashboard:

**File: `frontend/src/components/SyncAuth0Button.tsx`**

```typescript
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export const SyncAuth0Button = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/security/sync-auth0-logs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Sync failed");

      toast.success("Successfully synced failed logins from Auth0");
      window.location.reload(); // Refresh user list
    } catch (error) {
      toast.error("Failed to sync Auth0 logs");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button onClick={handleSync} disabled={syncing} variant="outline">
      <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync Auth0 Logs"}
    </Button>
  );
};
```

Add to your User Management page:
```typescript
import { SyncAuth0Button } from "@/components/SyncAuth0Button";

// In your JSX:
<div className="mb-4">
  <SyncAuth0Button />
</div>
```

---

## Testing

### Test the Current Setup (Manual Sync)

1. **Fail login 3 times** with your email
2. **See Auth0 block message** (like in your screenshot)
3. **As admin, call sync endpoint**:
   ```bash
   curl -X POST http://localhost:7000/api/security/sync-auth0-logs \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```
4. **Check MongoDB**:
   - `users` collection: `isBlocked: true` ✅
   - `failedlogins` collection: 3 records ✅
5. **Check Admin Dashboard**: User shows "Blocked" (red) ✅

---

## Summary

**Current State**: Manual sync works perfectly!

**Next Step Options**:
1. ✅ **Keep manual sync** - Call endpoint when needed
2. 🔄 **Add cron job** - Auto-sync every 5 minutes
3. 🌐 **Add webhook** - Real-time sync (most advanced)

**Recommended for now**: Add the "Sync Auth0 Logs" button to your admin dashboard so you can sync with one click!
