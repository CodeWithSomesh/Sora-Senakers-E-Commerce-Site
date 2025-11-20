# Dual Status Implementation: isActive + isBlocked

## Overview

Implemented a dual status system where both `isActive` and `isBlocked` work together to provide comprehensive user account management.

---

## Status Display Logic

The Status column in the User Management page now shows **3 different states**:

| Priority | Condition | Display | Color | Meaning |
|----------|-----------|---------|-------|---------|
| 1 (Highest) | `isBlocked = true` | **"Blocked"** | 🔴 Red | User blocked due to 3 failed logins or admin action |
| 2 | `isActive = false` | **"Deactivated"** | 🟡 Yellow | User account deactivated by admin |
| 3 (Default) | `isActive = true` AND `isBlocked = false` | **"Active"** | 🟢 Green | Normal active user |

**Priority System**: Blocked status takes precedence over Deactivated status.

---

## Backend Changes

### 1. **User Model** - [backend/src/models/user.ts](backend/src/models/user.ts)

Both fields exist:
```typescript
isActive: {
    type: Boolean,
    default: true,  // For general account activation/deactivation
},
isBlocked: {
    type: Boolean,
    default: false,  // For security blocking (failed logins)
},
```

### 2. **Admin User Controller** - [backend/src/controllers/AdminUserController.ts](backend/src/controllers/AdminUserController.ts)

**Four separate functions:**

#### Deactivate/Activate (for `isActive`)
- `deactivateAccount()` - Sets `isActive = false`
- `activateAccount()` - Sets `isActive = true`
- Used for general account management
- **Does NOT block in Auth0**

#### Block/Unblock (for `isBlocked`)
- `blockAccount()` - Sets `isBlocked = true` + blocks in Auth0
- `unblockAccount()` - Sets `isBlocked = false` + unblocks in Auth0
- Used for security blocking
- **Also blocks/unblocks in Auth0**

**Lines:**
- Deactivate: 100-142
- Activate: 145-172
- Block: 175-225
- Unblock: 228-263

### 3. **Admin Routes** - [backend/src/routes/AdminUserRoute.ts](backend/src/routes/AdminUserRoute.ts)

```typescript
// General account management
router.put("/:userId/deactivate", jwtCheck, jwtParse, AdminUserController.deactivateAccount);
router.put("/:userId/activate", jwtCheck, jwtParse, AdminUserController.activateAccount);

// Security blocking
router.put("/:userId/block", jwtCheck, jwtParse, AdminUserController.blockAccount);
router.put("/:userId/unblock", jwtCheck, jwtParse, AdminUserController.unblockAccount);
```

### 4. **Auto-Blocking** - [backend/src/controllers/SecurityAnalyticsController.ts](backend/src/controllers/SecurityAnalyticsController.ts#L69-L72)

After 3 failed login attempts:
```typescript
user.isBlocked = true;  // NOT isActive = false
await user.save();
await blockAuth0User(user.auth0Id);  // Also block in Auth0
```

---

## Frontend Changes

### 1. **Type Definition** - [frontend/src/types.ts](frontend/src/types.ts)

```typescript
export type User = {
    // ... other fields
    isActive?: boolean;   // General activation status
    isBlocked?: boolean;  // Security blocking status
};
```

### 2. **API Functions** - [frontend/src/api/AdminUserApi.tsx](frontend/src/api/AdminUserApi.tsx)

**Six API hooks:**
1. `useDeactivateAccount()` - PUT `/api/admin/users/:userId/deactivate`
2. `useActivateAccount()` - PUT `/api/admin/users/:userId/activate`
3. `useBlockAccount()` - PUT `/api/admin/users/:userId/block`
4. `useUnblockAccount()` - PUT `/api/admin/users/:userId/unblock`
5. `usePromoteToAdmin()` - Unchanged
6. `useDemoteToUser()` - Unchanged

### 3. **User Management Page** - [frontend/src/pages/UserManagementPage.tsx](frontend/src/pages/UserManagementPage.tsx)

#### Status Display (Lines 270-278)

```typescript
<span className={`... ${
    user.isBlocked
        ? "bg-red-100 text-red-800"      // Blocked (red)
        : !user.isActive
        ? "bg-yellow-100 text-yellow-800" // Deactivated (yellow)
        : "bg-green-100 text-green-800"   // Active (green)
}`}>
    {user.isBlocked ? "Blocked" : !user.isActive ? "Deactivated" : "Active"}
</span>
```

#### Button Logic (Lines 312-345)

```typescript
{user.isBlocked ? (
    // Show UNBLOCK button (green)
    <button onClick={() => handleUnblock(user._id, user.name)}>
        Unblock Account
    </button>
) : !user.isActive ? (
    // Show ACTIVATE button (blue)
    <button onClick={() => handleActivate(user._id, user.name)}>
        Activate Account
    </button>
) : (
    // Show BLOCK button (red)
    <button onClick={() => handleBlock(user._id, user.name, user)}>
        Block Account
    </button>
)}
```

#### Handler Functions

**Four handlers:**
1. `handleDeactivate()` - Deactivates account (sets `isActive = false`)
2. `handleActivate()` - Activates account (sets `isActive = true`)
3. `handleBlock()` - Blocks account (sets `isBlocked = true`)
4. `handleUnblock()` - Unblocks account (sets `isBlocked = false`)

---

## User Scenarios

### Scenario 1: Normal Active User

**Database:**
```javascript
{
  isActive: true,
  isBlocked: false
}
```

**Dashboard Display:** "Active" (green)
**Button Shown:** "Block Account" (red)

---

### Scenario 2: Admin Deactivates User

**Action:** Admin clicks deactivate → `PUT /api/admin/users/:userId/deactivate`

**Database After:**
```javascript
{
  isActive: false,  // Changed
  isBlocked: false
}
```

**Dashboard Display:** "Deactivated" (yellow)
**Button Shown:** "Activate Account" (blue)
**Auth0 Status:** Unchanged (still active in Auth0)

---

### Scenario 3: User Fails Login 3 Times

**Action:** Auto-blocking triggers after 3rd failed attempt

**Database After:**
```javascript
{
  isActive: true,   // Unchanged
  isBlocked: true   // Changed
}
```

**Dashboard Display:** "Blocked" (red)
**Button Shown:** "Unblock Account" (green)
**Auth0 Status:** Blocked

---

### Scenario 4: Both Blocked AND Deactivated

**Database:**
```javascript
{
  isActive: false,
  isBlocked: true
}
```

**Dashboard Display:** "Blocked" (red) - **Blocked takes priority!**
**Button Shown:** "Unblock Account" (green)

**Why?** Security blocking is more critical than general deactivation.

---

## API Endpoints

### General Account Management

| Endpoint | Method | Action | Database Change | Auth0 Change |
|----------|--------|--------|-----------------|--------------|
| `/api/admin/users/:userId/deactivate` | PUT | Deactivate | `isActive = false` | None |
| `/api/admin/users/:userId/activate` | PUT | Activate | `isActive = true` | None |

### Security Blocking

| Endpoint | Method | Action | Database Change | Auth0 Change |
|----------|--------|--------|-----------------|--------------|
| `/api/admin/users/:userId/block` | PUT | Block | `isBlocked = true` | `blocked = true` |
| `/api/admin/users/:userId/unblock` | PUT | Unblock | `isBlocked = false` | `blocked = false` |

---

## Testing

### Test 1: Deactivate User

1. Go to User Management
2. Click red ❌ button (Block Account)
3. Actually, if user is active, it shows Block - let me clarify...

Actually, let me correct the test based on actual behavior:

### Test 1: Block User (Failed Login Simulation)

```bash
# Call failed login API 3 times
curl -X POST http://localhost:7000/api/security/failed-login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","email":"test@example.com","reason":"invalid_credentials"}'
```

**Expected Results:**
- Database: `isBlocked: true`
- Dashboard: Shows "Blocked" (red)
- Button: Shows "Unblock Account" (green ✓)

### Test 2: Admin Deactivates User

**Manual Test:**
1. In User Management, note this requires you to manually call the deactivate endpoint
2. You can add a separate "Deactivate" button if needed, or use the API directly

**Deactivate a user:**
```bash
curl -X PUT http://localhost:7000/api/admin/users/{userId}/deactivate \
  -H "Authorization: Bearer {admin_token}"
```

**Expected Results:**
- Database: `isActive: false`, `isBlocked: false`
- Dashboard: Shows "Deactivated" (yellow)
- Button: Shows "Activate Account" (blue)

### Test 3: Unblock User

1. Find blocked user in dashboard
2. Click green ✓ "Unblock Account" button
3. Verify status changes to "Active" (green)

---

## Key Differences

| Feature | `isActive` | `isBlocked` |
|---------|-----------|-------------|
| **Purpose** | General account management | Security blocking |
| **Set By** | Admin manual action | Auto (3 failed logins) or Admin |
| **Auth0 Sync** | No | Yes |
| **Priority** | Lower | Higher |
| **Color** | Yellow (Deactivated) | Red (Blocked) |
| **Use Case** | Temporarily disable account | Block malicious/compromised accounts |

---

## Summary

✅ **Two separate fields**: `isActive` and `isBlocked`
✅ **Three status displays**: Active (green), Deactivated (yellow), Blocked (red)
✅ **Four admin actions**: Deactivate, Activate, Block, Unblock
✅ **Priority system**: Blocked status overrides Deactivated
✅ **Auto-blocking**: 3 failed logins sets `isBlocked = true`
✅ **Auth0 sync**: Only `isBlocked` syncs with Auth0

**Both systems work together** to provide comprehensive user account management!
