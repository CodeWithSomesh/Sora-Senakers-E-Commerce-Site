# 🔑 How to Get Your JWT Token for Testing

## Visual Step-by-Step Guide

### Method 1: From Browser Local Storage (Easiest)

#### Step 1: Login as Admin
1. Open browser: `http://localhost:3000`
2. Login with your admin credentials
3. You should be on the homepage or admin panel

#### Step 2: Open DevTools
- **Windows/Linux**: Press `F12` or `Ctrl+Shift+I`
- **Mac**: Press `Cmd+Option+I`

#### Step 3: Navigate to Local Storage
```
DevTools → Application Tab → Storage Section (left sidebar) → Local Storage → http://localhost:3000
```

You'll see a list of keys that look like:
```
@@auth0spajs@@::AbC123XyZ::default::openid profile email
```

#### Step 4: Find the Auth0 Key
- Look for the key that starts with `@@auth0spajs@@::`
- Click on it

#### Step 5: Copy the Access Token
In the **Value** column, you'll see a JSON object like:
```json
{
  "body": {
    "client_id": "...",
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZ...",
    "id_token": "...",
    "scope": "openid profile email",
    "expires_in": 86400,
    "token_type": "Bearer",
    "decodedToken": {...}
  },
  "expiresAt": 1234567890
}
```

**Copy the entire `access_token` value** (the very long string starting with `eyJ...`)

#### Step 6: Update Test File
1. Open `security-tests.http` in VS Code
2. Find line 9: `@token = YOUR_JWT_TOKEN_HERE`
3. Replace with: `@token = eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZ...` (your copied token)
4. Save the file (`Ctrl+S`)

---

### Method 2: From Network Tab (Alternative)

#### Step 1: Login and Open DevTools
1. Login as admin at `http://localhost:3000`
2. Press `F12` → Go to **Network** tab

#### Step 2: Make an API Request
1. Navigate to Admin Panel → Analytics
2. The page will make API requests

#### Step 3: Find an API Request
1. In Network tab, filter by `Fetch/XHR`
2. Look for a request to `/api/security/dashboard` or any `/api/` endpoint

#### Step 4: View Request Headers
1. Click on the request
2. Go to **Headers** tab
3. Scroll to **Request Headers** section
4. Find: `Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZ...`

#### Step 5: Copy Token
Copy everything **after** `Bearer ` (don't include "Bearer " itself)

---

### Method 3: From Console (Quick)

#### Step 1: Login and Open Console
1. Login as admin
2. Press `F12` → **Console** tab

#### Step 2: Run JavaScript Command
Paste this into console and press Enter:
```javascript
Object.keys(localStorage).filter(k => k.includes('auth0')).map(k => {
  try {
    const data = JSON.parse(localStorage.getItem(k));
    return data.body.access_token;
  } catch(e) { return null; }
}).filter(t => t)[0]
```

#### Step 3: Copy the Token
The console will output your token. Copy it!

---

## 🔍 Verify Your Token

Your token should look like:
```
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik5qRTVNa...
```

**Token Characteristics:**
- ✅ Starts with `eyJ`
- ✅ Very long (usually 500-1000+ characters)
- ✅ Contains two dots (`.`) separating 3 parts
- ✅ Only contains letters, numbers, hyphens, and underscores
- ❌ Does NOT contain spaces
- ❌ Does NOT start with "Bearer"

---

## 🧪 Test Your Token

### Quick Test in security-tests.http:

1. Update the token:
```http
@token = eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik... (your token)
```

2. Run **Test 0.1** (Check Backend Health):
```http
GET http://localhost:7000/api/security/dashboard
Authorization: Bearer {{token}}
```

3. Click **"Send Request"**

### Expected Results:

**✅ Success (200 OK):**
```json
{
  "metrics": {
    "failedLoginCount": 0,
    "flaggedLogins": 0,
    ...
  },
  "failedLogins": [],
  ...
}
```

**❌ Failed (401 Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```
**Solution:** Token is expired or invalid. Get a fresh token.

**❌ Failed (500 Internal Server Error):**
```json
{
  "message": "Failed to track admin action"
}
```
**Solution:** Backend has an error. Check backend console logs.

---

## ⏰ Token Expiration

**Important:** Auth0 tokens expire!

- **Default expiration:** 24 hours (86400 seconds)
- **When expired:** You'll get `401 Unauthorized` errors
- **Solution:** Get a fresh token using steps above

**Pro Tip:** If your tests suddenly stop working, get a fresh token first before debugging!

---

## 🚨 Troubleshooting

### Problem: "YOUR_JWT_TOKEN_HERE" Still Shows in Token Variable
**Solution:** You forgot to replace it! Follow steps above to get real token.

### Problem: Token Starts with "Bearer"
**Solution:** Remove "Bearer " from the beginning. Token should start with `eyJ`.

### Problem: Token is Very Short (< 100 characters)
**Solution:** You copied the wrong value. Make sure you copy the `access_token` field, not `id_token` or `client_id`.

### Problem: 401 Unauthorized Error
**Solutions:**
1. Token expired → Get fresh token
2. Token is for wrong Auth0 tenant → Make sure you're logged into the right app
3. Token missing → Check that `@token` variable is set correctly

### Problem: 500 Internal Server Error
**Solutions:**
1. Backend not running → Run `npm run dev` in backend folder
2. Database connection issue → Check MongoDB is running
3. Auth0 configuration issue → Check `.env` file has correct Auth0 credentials

---

## 📋 Quick Checklist

Before running admin tests (Test 2.x, Test 3.x):

- [ ] Backend is running (`npm run dev`)
- [ ] You're logged in as admin in browser
- [ ] You've copied the token from Local Storage
- [ ] Token is updated in `security-tests.http` line 9
- [ ] Token starts with `eyJ`
- [ ] Token is 500+ characters long
- [ ] File is saved (`Ctrl+S`)

Now run your test! 🎉

---

## Example: Complete Token Setup

```http
###############################################################################
# SECURITY ANALYTICS TEST CASES
###############################################################################

### Variables
@baseUrl = http://localhost:7000
@token = eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik5qRTVNa015TlRRd056WXhPVGt6UkRJd05EVTBNVEl4T1RFNU1rWTNSVFE1TkEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2Rldi14eHh4eHguYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDY1ZjRhM2IzZDk3ZTIwMGQ4YmMyNzk1YiIsImF1ZCI6WyJodHRwOi8vbG9jYWxob3N0OjcwMDAiLCJodHRwczovL2Rldi14eHh4eHguYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTczMjA4NjMxMywiZXhwIjoxNzMyMTcyNzEzLCJhenAiOiJBYkMxMjNYeVoiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.abc123xyz...

### Test 2.1: Track Product Deletion
POST {{baseUrl}}/api/security/admin-action
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "adminId": "admin123",
  "adminUsername": "admin@sorasneakers.com",
  "actionType": "product_delete",
  "targetType": "product",
  "targetId": "prod_12345",
  "targetName": "Nike Air Max 2024"
}
```

**Now click "Send Request" and it should work!** ✅
