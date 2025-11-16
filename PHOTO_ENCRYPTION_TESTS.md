# 🔒 Encrypted Profile Photo - Test Cases

## Test Case 8: Encrypted Profile Photo Upload

### 8.1 Photo Upload with Encryption

**Test Steps:**
1. Login to the application
2. Navigate to User Profile page
3. Scroll to "Profile Photo" section
4. Click "Upload Photo" button
5. Select a valid image file (JPEG/PNG, < 5MB)
6. Click "Encrypt & Upload" button

**Test Cases:**

| Test ID | File Type | File Size | Expected Result | Status |
|---------|-----------|-----------|-----------------|--------|
| EP-001 | JPEG (1MB) | 1MB | ✅ Upload successful, encrypted badge shown | ☐ Pass ☐ Fail |
| EP-002 | PNG (2MB) | 2MB | ✅ Upload successful | ☐ Pass ☐ Fail |
| EP-003 | WebP (500KB) | 500KB | ✅ Upload successful | ☐ Pass ☐ Fail |
| EP-004 | JPEG (4.9MB) | 4.9MB | ✅ Upload successful | ☐ Pass ☐ Fail |
| EP-005 | JPEG (6MB) | 6MB | ❌ Error: "File too large. Maximum size is 5MB" | ☐ Pass ☐ Fail |
| EP-006 | GIF (1MB) | 1MB | ❌ Error: "Invalid file type" | ☐ Pass ☐ Fail |
| EP-007 | PDF | 1MB | ❌ Error: "Invalid file type" | ☐ Pass ☐ Fail |
| EP-008 | SVG | 100KB | ❌ Error: "Invalid file type" | ☐ Pass ☐ Fail |

### 8.2 Encryption Verification (Database Level)

**Test Steps:**
1. Upload a profile photo
2. Connect to MongoDB database
3. Query user document
4. Inspect `profilePhoto` field

**Verification Checklist:**

- [ ] `encryptedData` field contains Base64 string (not readable image)
- [ ] `iv` field contains 32-character hexadecimal string
- [ ] `mimeType` field shows correct image type (e.g., "image/jpeg")
- [ ] `uploadedAt` field contains valid timestamp
- [ ] Original image data is NOT visible in database
- [ ] Encrypted data changes when same image re-uploaded (due to new IV)

**MongoDB Query:**
```javascript
db.users.findOne({ email: "test@example.com" }, { profilePhoto: 1 })
```

**Expected Output:**
```json
{
  "profilePhoto": {
    "encryptedData": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRIip...base64 string",
    "iv": "5e5b2d8f9c3a1b4e7f8a9b0c1d2e3f40",
    "mimeType": "image/jpeg",
    "uploadedAt": "2025-11-16T10:30:00.000Z"
  }
}
```

### 8.3 Photo Retrieval and Decryption

**Test Steps:**
1. Upload a profile photo
2. Refresh the page
3. Navigate back to User Profile
4. Verify photo displays correctly

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| EP-101 | Photo displays after upload | ✅ Image shows correctly | ☐ Pass ☐ Fail |
| EP-102 | Photo displays after page refresh | ✅ Image persists | ☐ Pass ☐ Fail |
| EP-103 | Photo displays after logout/login | ✅ Image persists | ☐ Pass ☐ Fail |
| EP-104 | Encryption badge visible | ✅ Green lock icon with "Encrypted with AES-256" | ☐ Pass ☐ Fail |

### 8.4 API Endpoint Testing

#### Test 1: Upload without authentication
```bash
curl -X POST http://localhost:7000/api/my/user/photo \
  -F "profilePhoto=@test-image.jpg"

# Expected: 401 Unauthorized
```

| Test ID | Expected Status | Expected Response | Status |
|---------|----------------|-------------------|--------|
| EP-201 | 401 | Unauthorized | ☐ Pass ☐ Fail |

#### Test 2: Upload with authentication
```bash
curl -X POST http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePhoto=@test-image.jpg"

# Expected: 200 Success
```

| Test ID | Expected Status | Expected Response | Status |
|---------|----------------|-------------------|--------|
| EP-202 | 200 | {"message": "Profile photo uploaded and encrypted successfully"} | ☐ Pass ☐ Fail |

#### Test 3: Upload invalid file type
```bash
curl -X POST http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePhoto=@document.pdf"

# Expected: 400 Bad Request
```

| Test ID | Expected Status | Expected Response | Status |
|---------|----------------|-------------------|--------|
| EP-203 | 400 | {"error": "Invalid file type..."} | ☐ Pass ☐ Fail |

#### Test 4: Upload oversized file
```bash
# Create 10MB test file
dd if=/dev/zero of=large-image.jpg bs=1M count=10

curl -X POST http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePhoto=@large-image.jpg"

# Expected: 400 Bad Request
```

| Test ID | Expected Status | Expected Response | Status |
|---------|----------------|-------------------|--------|
| EP-204 | 400 | {"error": "File too large..."} | ☐ Pass ☐ Fail |

#### Test 5: Get photo without authentication
```bash
curl -X GET http://localhost:7000/api/my/user/photo

# Expected: 401 Unauthorized
```

| Test ID | Expected Status | Expected Response | Status |
|---------|----------------|-------------------|--------|
| EP-205 | 401 | Unauthorized | ☐ Pass ☐ Fail |

#### Test 6: Get photo with authentication (photo exists)
```bash
curl -X GET http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output profile-photo.jpg

# Expected: 200 + Image file
```

| Test ID | Expected Status | Expected Content-Type | Status |
|---------|----------------|----------------------|--------|
| EP-206 | 200 | image/jpeg (or uploaded type) | ☐ Pass ☐ Fail |

#### Test 7: Get photo when none exists
```bash
# Delete photo first, then try to get
curl -X DELETE http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X GET http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 404 Not Found
```

| Test ID | Expected Status | Expected Response | Status |
|---------|----------------|-------------------|--------|
| EP-207 | 404 | {"error": "No profile photo found"} | ☐ Pass ☐ Fail |

### 8.5 Photo Deletion

**Test Steps:**
1. Upload a profile photo
2. Click "Delete Photo" button
3. Confirm deletion
4. Verify photo is removed

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| EP-301 | Delete button appears | ✅ "Delete Photo" button visible | ☐ Pass ☐ Fail |
| EP-302 | Confirmation dialog shown | ✅ "Are you sure?" prompt | ☐ Pass ☐ Fail |
| EP-303 | Photo removed from UI | ✅ Photo disappears, camera icon shown | ☐ Pass ☐ Fail |
| EP-304 | Photo removed from DB | ✅ profilePhoto field undefined in MongoDB | ☐ Pass ☐ Fail |
| EP-305 | Success notification | ✅ "Profile photo deleted successfully" | ☐ Pass ☐ Fail |

#### API Test: Delete photo
```bash
curl -X DELETE http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 Success
```

| Test ID | Expected Status | Expected Response | Status |
|---------|----------------|-------------------|--------|
| EP-306 | 200 | {"message": "Profile photo deleted successfully"} | ☐ Pass ☐ Fail |

### 8.6 Photo Metadata

**Test Steps:**
1. Upload a profile photo
2. Request photo metadata via API
3. Verify metadata accuracy

```bash
curl -X GET http://localhost:7000/api/my/user/photo/metadata \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "hasPhoto": true,
  "mimeType": "image/jpeg",
  "uploadedAt": "2025-11-16T10:30:00.000Z",
  "encrypted": true
}
```

| Test ID | Field | Expected Value | Status |
|---------|-------|----------------|--------|
| EP-401 | hasPhoto | true | ☐ Pass ☐ Fail |
| EP-402 | mimeType | Matches uploaded type | ☐ Pass ☐ Fail |
| EP-403 | uploadedAt | Valid ISO date | ☐ Pass ☐ Fail |
| EP-404 | encrypted | true | ☐ Pass ☐ Fail |

### 8.7 Security Tests

#### Test 1: User A cannot access User B's photo
```bash
# Login as User A, get JWT token A
USER_A_TOKEN="eyJ...token_A"

# Login as User B, upload photo, get JWT token B
USER_B_TOKEN="eyJ...token_B"

# User A tries to access User B's photo endpoint
# (This should fail because photo endpoint uses req.userId from JWT)

# Test: Each user can only access their own photo
```

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| EP-501 | User A can access own photo | ✅ 200 Success | ☐ Pass ☐ Fail |
| EP-502 | User B can access own photo | ✅ 200 Success | ☐ Pass ☐ Fail |
| EP-503 | User A cannot see User B's photo | ✅ Different photos (or 404 if no photo) | ☐ Pass ☐ Fail |

#### Test 2: Encrypted data cannot be decrypted without key
```bash
# 1. Upload photo with key A
IMAGE_ENCRYPTION_KEY=keyA node server.js
# Upload photo

# 2. Change encryption key to key B
IMAGE_ENCRYPTION_KEY=keyB node server.js
# Try to retrieve photo

# Expected: Decryption error
```

| Test ID | Scenario | Expected Result | Status |
|---------|----------|-----------------|--------|
| EP-504 | Decrypt with correct key | ✅ Image displays | ☐ Pass ☐ Fail |
| EP-505 | Decrypt with wrong key | ❌ Decryption error | ☐ Pass ☐ Fail |

#### Test 3: IV uniqueness
```bash
# Upload same image twice
# Check database - IVs should be different
```

| Test ID | Check | Expected Result | Status |
|---------|-------|-----------------|--------|
| EP-506 | Upload same image twice | Different IVs generated | ☐ Pass ☐ Fail |
| EP-507 | Encrypted data differs | Different encrypted Base64 strings | ☐ Pass ☐ Fail |

### 8.8 Frontend Validation Tests

**Test Steps:**
1. Go to User Profile
2. Attempt to upload various files

| Test ID | File Type | Expected Behavior | Status |
|---------|-----------|-------------------|--------|
| EP-601 | .txt file | ❌ File input rejects, or error shown | ☐ Pass ☐ Fail |
| EP-602 | .docx file | ❌ Rejected | ☐ Pass ☐ Fail |
| EP-603 | .mp4 video | ❌ Rejected | ☐ Pass ☐ Fail |
| EP-604 | .gif file | ❌ Rejected with error message | ☐ Pass ☐ Fail |
| EP-605 | 10MB JPEG | ❌ "File too large" error before upload | ☐ Pass ☐ Fail |
| EP-606 | Valid JPEG | ✅ Preview shown, ready to upload | ☐ Pass ☐ Fail |

### 8.9 UI/UX Tests

| Test ID | Element | Expected Behavior | Status |
|---------|---------|-------------------|--------|
| EP-701 | Camera icon | Shows when no photo uploaded | ☐ Pass ☐ Fail |
| EP-702 | Lock badge | Shows on uploaded photo | ☐ Pass ☐ Fail |
| EP-703 | "Encrypted with AES-256" text | Visible below photo | ☐ Pass ☐ Fail |
| EP-704 | Upload progress | "Encrypting & Uploading..." shown during upload | ☐ Pass ☐ Fail |
| EP-705 | Preview before upload | Selected image previews before upload | ☐ Pass ☐ Fail |
| EP-706 | Cancel button | Clears preview and selection | ☐ Pass ☐ Fail |
| EP-707 | Delete confirmation | Shows "Are you sure?" dialog | ☐ Pass ☐ Fail |
| EP-708 | Success notification | Green toast notification on success | ☐ Pass ☐ Fail |
| EP-709 | Error notification | Red toast notification on error | ☐ Pass ☐ Fail |
| EP-710 | Security notice | Shows encryption info at bottom | ☐ Pass ☐ Fail |

### 8.10 Performance Tests

| Test ID | Metric | Target | Actual | Status |
|---------|--------|--------|--------|--------|
| EP-801 | 1MB photo encryption time | < 100ms | \_\_\_ms | ☐ Pass ☐ Fail |
| EP-802 | 1MB photo decryption time | < 100ms | \_\_\_ms | ☐ Pass ☐ Fail |
| EP-803 | Upload total time | < 3 seconds | \_\_\_s | ☐ Pass ☐ Fail |
| EP-804 | Photo retrieval time | < 1 second | \_\_\_s | ☐ Pass ☐ Fail |
| EP-805 | Encrypted data size overhead | ~33% (Base64) | \_\_\_% | ☐ Pass ☐ Fail |

### 8.11 Error Handling Tests

| Test ID | Scenario | Expected Error Message | Status |
|---------|----------|----------------------|--------|
| EP-901 | No file selected | "No photo file provided" | ☐ Pass ☐ Fail |
| EP-902 | Network error during upload | "Failed to upload photo" + toast | ☐ Pass ☐ Fail |
| EP-903 | Server error (500) | "Failed to upload photo" + error details | ☐ Pass ☐ Fail |
| EP-904 | Missing encryption key | "Server configuration error" | ☐ Pass ☐ Fail |
| EP-905 | Invalid JWT token | 401 Unauthorized | ☐ Pass ☐ Fail |
| EP-906 | Expired JWT token | 401 Unauthorized + redirect to login | ☐ Pass ☐ Fail |

---

## Integration Testing Scenario

### Complete Photo Upload Flow Test

**Steps:**
1. ☐ Fresh user registration
2. ☐ Login to application
3. ☐ Navigate to User Profile
4. ☐ Upload profile photo (2MB JPEG)
5. ☐ Verify encryption badge appears
6. ☐ Logout
7. ☐ Login again
8. ☐ Verify photo still displays
9. ☐ Check MongoDB - verify encrypted data
10. ☐ Replace photo with new image
11. ☐ Verify old photo replaced
12. ☐ Delete photo
13. ☐ Verify photo removed
14. ☐ Upload new photo again
15. ☐ All successful → Test PASS

**Overall Status:** ☐ Pass ☐ Fail

---

## Automated Test Script

```javascript
// test-photo-encryption.js
const crypto = require('crypto');
const fs = require('fs');

// Test encryption/decryption utilities
function testEncryptionDecryption() {
  const testData = Buffer.from('Hello World');
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  // Encrypt
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(testData);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Decrypt
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  // Verify
  const success = decrypted.toString() === 'Hello World';
  console.log(`✅ Encryption/Decryption Test: ${success ? 'PASS' : 'FAIL'}`);
  return success;
}

// Test with actual image file
function testImageEncryption() {
  try {
    const imageBuffer = fs.readFileSync('test-image.jpg');
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);

    // Encrypt
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(imageBuffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Decrypt
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // Verify
    const success = Buffer.compare(imageBuffer, decrypted) === 0;
    console.log(`✅ Image Encryption Test: ${success ? 'PASS' : 'FAIL'}`);
    return success;
  } catch (error) {
    console.error('❌ Image Encryption Test: FAIL', error.message);
    return false;
  }
}

// Run tests
console.log('🧪 Running Encryption Tests...\n');
const test1 = testEncryptionDecryption();
const test2 = testImageEncryption();

console.log(`\n📊 Results: ${test1 && test2 ? '✅ ALL PASS' : '❌ SOME FAILED'}`);
```

Run with: `node test-photo-encryption.js`

---

## Test Summary Checklist

- [ ] All upload validation tests passing
- [ ] Database encryption verified
- [ ] Photo retrieval working correctly
- [ ] API endpoints secured with JWT
- [ ] Unauthorized access blocked
- [ ] Invalid file types rejected
- [ ] File size limits enforced
- [ ] Photo deletion working
- [ ] Metadata endpoint functional
- [ ] UI elements displaying correctly
- [ ] Error messages appropriate
- [ ] Performance within targets
- [ ] Encryption/decryption verified
- [ ] IV uniqueness confirmed
- [ ] Integration flow complete

**Total Tests:** 60+
**Tests Passed:** \_\_\_
**Tests Failed:** \_\_\_
**Pass Rate:** \_\_\_%

**Tester:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_
**Status:** ☐ APPROVED ☐ NEEDS WORK

---

**Last Updated:** 2025-11-16
**Version:** 1.0.0
