# Changes Made: Using `isBlocked` Instead of `isActive`

## Summary

Changed the system to use a new `isBlocked` attribute instead of modifying `isActive` for blocking users. When a user is blocked after 3 failed login attempts, `isBlocked` is set to `true`, and the admin dashboard now displays "Blocked" status.

---

## Files Modified

### Backend Changes

#### 1. **User Model** - [backend/src/models/user.ts](backend/src/models/user.ts)

**Added new field:**
```typescript
isBlocked:{
    type: Boolean,
    default: false,
},
```

**Line:** 41-44

---

#### 2. **Security Analytics Controller** - [backend/src/controllers/SecurityAnalyticsController.ts](backend/src/controllers/SecurityAnalyticsController.ts)

**Changed auto-blocking logic:**

**Before:**
```typescript
if (user && user.isActive) {
    user.isActive = false;
    await user.save();
```

**After:**
```typescript
if (user && !user.isBlocked) {
    user.isBlocked = true;
    await user.save();
```

**Lines:** 69-72

**What it does:** When 3 failed login attempts are detected, sets `isBlocked = true` instead of `isActive = false`.

---

#### 3. **Admin User Controller** - [backend/src/controllers/AdminUserController.ts](backend/src/controllers/AdminUserController.ts)

**Changes in `deactivateAccount` function:**

```typescript
// Line 115: Check if already blocked
if (user.isBlocked) {
    return res.status(400).json({ message: "User account is already blocked" });
}

// Line 134: Set isBlocked instead of isActive
user.isBlocked = true;
await user.save();

// Line 145: Updated response message
res.json({ message: "User account blocked successfully", user });
```

**Changes in `activateAccount` function:**

```typescript
// Line 168: Check if user is blocked
if (!user.isBlocked) {
    return res.status(400).json({ message: "User account is not blocked" });
}

// Line 172: Unblock user
user.isBlocked = false;
await user.save();

// Line 183: Updated response message
res.json({ message: "User account unblocked successfully", user });
```

**Changes in `checkBlockStatus` function:**

```typescript
// Line 207: Return isBlocked status
return res.json({ isBlocked: user.isBlocked });
```

**Previously returned:** `!user.isActive`
**Now returns:** `user.isBlocked`

---

### Frontend Changes

#### 4. **Type Definition** - [frontend/src/types.ts](frontend/src/types.ts)

**Added new field to User type:**
```typescript
export type User = {
    // ... existing fields
    isBlocked?: boolean;
};
```

**Line:** 13

---

#### 5. **User Management Page** - [frontend/src/pages/UserManagementPage.tsx](frontend/src/pages/UserManagementPage.tsx)

**Status Display (Lines 226-231):**

**Before:**
```typescript
<span className={`... ${
    user.isActive !== false
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
}`}>
    {user.isActive !== false ? "Active" : "Deactivated"}
</span>
```

**After:**
```typescript
<span className={`... ${
    user.isBlocked
        ? "bg-red-100 text-red-800"
        : "bg-green-100 text-green-800"
}`}>
    {user.isBlocked ? "Blocked" : "Active"}
</span>
```

**Button Logic (Lines 266-291):**

**Before:** Checked `user.isActive !== false`
**After:** Checks `!user.isBlocked`

**Button Titles:**
- "Deactivate Account" → "Block Account"
- "Activate Account" → "Unblock Account"

**Handler Function Updates (Lines 86-126):**

**Error Messages:**
- "You cannot deactivate your own account" → "You cannot block your own account"
- "Super admins cannot be deactivated" → "Super admins cannot be blocked"
- "Only super admins can deactivate other admins" → "Only super admins can block other admins"

**Dialog Titles:**
- "Deactivate Account" → "Block Account"
- "Activate Account" → "Unblock Account"

---

## How It Works Now

### Automatic Blocking (After 3 Failed Attempts)

1. User fails login 3 times
2. `trackFailedLogin` endpoint is called
3. System detects 3+ attempts in last 24 hours
4. **Sets `isBlocked = true`** in database ✅
5. Blocks user in Auth0
6. Creates `account_locked` security log

### Admin Dashboard Display

- **If `isBlocked = true`**: Shows red badge "Blocked"
- **If `isBlocked = false`**: Shows green badge "Active"

### Admin Controls

- **Block button**: Sets `isBlocked = true`
- **Unblock button**: Sets `isBlocked = false`

---

## Database Fields

| Field | Purpose | Default Value |
|-------|---------|---------------|
| `isActive` | User account activation status (unchanged) | `true` |
| `isBlocked` | User blocked due to failed logins or admin action | `false` |

**Key difference:**
- `isActive` = General account status (for future use)
- `isBlocked` = Security blocking (failed logins, admin block)

---

## Testing

### Test Blocked Status Display

1. **Block a user via API:**
   ```bash
   curl -X POST http://localhost:7000/api/security/failed-login \
     -H "Content-Type: application/json" \
     -d '{"username":"test@example.com","email":"test@example.com","reason":"invalid_credentials"}'
   ```
   Run this 3 times.

2. **Check MongoDB:**
   - `users` collection: `isBlocked: true` ✅

3. **Check Admin Dashboard:**
   - Status column should show: **"Blocked"** in red ✅

4. **Unblock the user:**
   - Click green "Unblock" button
   - Status should change to **"Active"** in green ✅

---

## API Response Changes

### Block User

**Endpoint:** `PUT /api/admin/users/:userId/deactivate`

**Response:**
```json
{
  "message": "User account blocked successfully",
  "user": {
    "_id": "...",
    "email": "...",
    "isBlocked": true
  }
}
```

### Unblock User

**Endpoint:** `PUT /api/admin/users/:userId/activate`

**Response:**
```json
{
  "message": "User account unblocked successfully",
  "user": {
    "_id": "...",
    "email": "...",
    "isBlocked": false
  }
}
```

### Check Block Status

**Endpoint:** `GET /api/admin/users/check-block-status?auth0Id=xxx`

**Response:**
```json
{
  "isBlocked": true
}
```

---

## Summary of Changes

✅ **Added:** `isBlocked` field to User model
✅ **Changed:** Auto-blocking sets `isBlocked = true` (not `isActive = false`)
✅ **Changed:** Admin block/unblock functions use `isBlocked`
✅ **Changed:** Auth0 Action checks `isBlocked`
✅ **Changed:** Frontend displays "Blocked" / "Active" based on `isBlocked`
✅ **Changed:** Button labels and tooltips updated to "Block" / "Unblock"

---

## Migration Note

**Existing users in database:**
- All existing users have `isBlocked: false` by default
- No migration script needed
- MongoDB will add the field automatically when documents are saved

**If you need to set isBlocked for existing blocked users:**
```javascript
// In MongoDB shell
db.users.updateMany(
  { isActive: false },  // Find users that were previously "deactivated"
  { $set: { isBlocked: true } }  // Set isBlocked to true
);
```

---

All changes are complete and ready to test!
