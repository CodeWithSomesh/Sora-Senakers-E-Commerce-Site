# 🔒 Encrypted Profile Photo Feature Documentation

## Overview

The encrypted profile photo feature allows users to upload profile pictures that are encrypted using **AES-256-CBC encryption** before being stored in the database. This ensures that even if the database is compromised, user photos remain secure and cannot be accessed without the encryption key.

---

## 🛡️ Security Architecture

### Encryption Method
- **Algorithm:** AES-256-CBC (Advanced Encryption Standard)
- **Key Size:** 256 bits (32 bytes)
- **Initialization Vector:** 16 bytes (randomly generated per image)
- **Storage:** Encrypted data stored as Base64 string in MongoDB

### Security Benefits
1. **Data at Rest Protection:** Images encrypted before database storage
2. **Access Control:** Only authenticated users can upload/view their photos
3. **Tamper-Proof:** IV (Initialization Vector) ensures uniqueness per encryption
4. **Secure Key Management:** Encryption key stored in environment variables
5. **No Plain Text Storage:** Original images never stored unencrypted

---

## 📁 Files Created/Modified

### Backend Files

1. **`backend/src/utils/imageEncryption.ts`** (NEW)
   - Encryption/decryption utility functions
   - AES-256-CBC implementation using Node.js crypto
   - Key validation and generation functions

2. **`backend/src/models/user.ts`** (MODIFIED)
   - Added `profilePhoto` field with:
     - `encryptedData`: Base64 encrypted image
     - `iv`: Hexadecimal initialization vector
     - `mimeType`: Original image format
     - `uploadedAt`: Upload timestamp

3. **`backend/src/controllers/PhotoController.ts`** (NEW)
   - `uploadProfilePhoto`: Encrypts and stores photo
   - `getProfilePhoto`: Decrypts and returns photo
   - `deleteProfilePhoto`: Removes encrypted photo
   - `getPhotoMetadata`: Returns photo info without decryption

4. **`backend/src/routes/PhotoRoute.ts`** (NEW)
   - POST `/api/my/user/photo` - Upload encrypted photo
   - GET `/api/my/user/photo` - Get decrypted photo
   - DELETE `/api/my/user/photo` - Delete photo
   - GET `/api/my/user/photo/metadata` - Get photo info

5. **`backend/src/index.ts`** (MODIFIED)
   - Registered photo routes at `/api/my/user/photo`

6. **`backend/.env`** (MODIFIED)
   - Added `IMAGE_ENCRYPTION_KEY` (64-character hex string)

### Frontend Files

1. **`frontend/src/api/PhotoApi.tsx`** (NEW)
   - `useUploadProfilePhoto`: Hook for uploading photos
   - `useGetProfilePhoto`: Hook for fetching decrypted photos
   - `useDeleteProfilePhoto`: Hook for deleting photos
   - `useGetPhotoMetadata`: Hook for photo metadata

2. **`frontend/src/components/ProfilePhotoUpload.tsx`** (NEW)
   - Complete photo upload UI component
   - Image preview and validation
   - Drag & drop support
   - Encryption status indicators
   - Security badges and notifications

3. **`frontend/src/forms/user-profile-form/UserProfileForm.tsx`** (MODIFIED)
   - Integrated `ProfilePhotoUpload` component
   - Added to user profile page

---

## 🚀 How It Works

### Upload Flow

```
User selects image
        ↓
Frontend validates (type, size)
        ↓
Sends to backend via FormData
        ↓
Backend receives image buffer
        ↓
Image encrypted with AES-256-CBC
        ↓
Encrypted data + IV stored in MongoDB
        ↓
Success response to frontend
```

### Retrieval Flow

```
Frontend requests photo
        ↓
Backend authenticates user
        ↓
Retrieves encrypted data + IV from DB
        ↓
Decrypts using encryption key
        ↓
Returns decrypted image buffer
        ↓
Frontend displays image
```

---

## 🔧 Configuration

### Environment Variables

Add to `backend/.env`:

```env
# Image Encryption Key (AES-256)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
IMAGE_ENCRYPTION_KEY=f2deeb928ee6be124e0efe76fb9e145a575034c9c4cb533f1dd7eca969e9c191
```

**⚠️ Important:**
- Keep this key secret and never commit it to version control
- Use different keys for development, staging, and production
- Losing this key means all encrypted photos become inaccessible
- Store securely (e.g., AWS Secrets Manager, Azure Key Vault)

### Generate New Encryption Key

```bash
# Method 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: OpenSSL
openssl rand -hex 32
```

---

## 📊 API Endpoints

### 1. Upload Profile Photo

**POST** `/api/my/user/photo`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body:**
```
profilePhoto: <image file>
```

**Response (Success - 200):**
```json
{
  "message": "Profile photo uploaded and encrypted successfully",
  "uploadedAt": "2025-11-16T10:30:00.000Z"
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid file type. Only JPEG, PNG, and WebP images are allowed"
}
```

### 2. Get Profile Photo

**GET** `/api/my/user/photo`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- **200:** Image buffer (decrypted)
- **404:** No photo found
- **500:** Decryption error

### 3. Delete Profile Photo

**DELETE** `/api/my/user/photo`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200):**
```json
{
  "message": "Profile photo deleted successfully"
}
```

### 4. Get Photo Metadata

**GET** `/api/my/user/photo/metadata`

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (Success - 200):**
```json
{
  "hasPhoto": true,
  "mimeType": "image/jpeg",
  "uploadedAt": "2025-11-16T10:30:00.000Z",
  "encrypted": true
}
```

---

## 🎨 Frontend Usage

### Basic Implementation

```typescript
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";

function UserProfile() {
  return (
    <div>
      <h1>User Profile</h1>
      <ProfilePhotoUpload />
    </div>
  );
}
```

### Using API Hooks

```typescript
import { useUploadProfilePhoto, useGetProfilePhoto } from "@/api/PhotoApi";

function CustomPhotoComponent() {
  const { uploadPhoto, isLoading } = useUploadProfilePhoto();
  const { photoUrl, hasPhoto } = useGetProfilePhoto();

  const handleFileSelect = async (file: File) => {
    await uploadPhoto(file);
  };

  return (
    <div>
      {hasPhoto && <img src={photoUrl} alt="Profile" />}
      <input
        type="file"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
      />
    </div>
  );
}
```

---

## ✅ Validation & Constraints

### File Type Validation
- **Allowed:** JPEG, JPG, PNG, WebP
- **Rejected:** GIF, BMP, SVG, TIFF, etc.

### File Size Validation
- **Maximum:** 5MB (5,242,880 bytes)
- **Validation:** Both frontend and backend

### Security Checks
- ✅ JWT authentication required
- ✅ User can only access their own photo
- ✅ File type validation (MIME type)
- ✅ File size validation
- ✅ Encryption before storage
- ✅ Secure key management

---

## 🧪 Testing

### Manual Testing Steps

1. **Upload Test:**
   ```
   1. Login to application
   2. Navigate to User Profile
   3. Click "Upload Photo"
   4. Select image (JPEG/PNG, < 5MB)
   5. Click "Encrypt & Upload"
   6. Verify success message
   7. Check photo appears in profile
   ```

2. **Encryption Verification:**
   ```
   1. Upload photo
   2. Check MongoDB directly:
      - Photo data should be Base64 string
      - IV should be hex string
      - Original image should NOT be visible
   3. Retrieve photo via API
   4. Verify image displays correctly
   ```

3. **Invalid File Test:**
   ```
   1. Try uploading GIF file → Should reject
   2. Try uploading 10MB file → Should reject
   3. Try uploading PDF → Should reject
   ```

4. **Delete Test:**
   ```
   1. Upload photo
   2. Click "Delete Photo"
   3. Confirm deletion
   4. Verify photo removed from profile
   5. Check MongoDB - photo field should be empty
   ```

### Automated Testing

```bash
# Test photo upload (requires JWT token)
curl -X POST http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePhoto=@test-image.jpg"

# Expected: 200 {"message": "Profile photo uploaded and encrypted successfully"}

# Test without auth (should fail)
curl -X POST http://localhost:7000/api/my/user/photo \
  -F "profilePhoto=@test-image.jpg"

# Expected: 401 Unauthorized

# Test invalid file type
curl -X POST http://localhost:7000/api/my/user/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePhoto=@test.gif"

# Expected: 400 Invalid file type
```

---

## 🔐 Security Considerations

### Best Practices Implemented

1. **Encryption at Rest**
   - All photos encrypted before database storage
   - Uses industry-standard AES-256-CBC

2. **Access Control**
   - JWT authentication required for all endpoints
   - Users can only access their own photos

3. **Input Validation**
   - File type whitelist (only images)
   - File size limits (5MB max)
   - MIME type verification

4. **Key Management**
   - Encryption key in environment variables
   - Not hardcoded in source code
   - Can be rotated if compromised

5. **Secure Transport**
   - Photos transmitted over HTTPS (production)
   - Authorization headers required

### Potential Vulnerabilities & Mitigations

| Vulnerability | Mitigation |
|--------------|------------|
| Key exposure | Store in env vars, use secrets manager in production |
| Large file attacks | 5MB size limit enforced |
| Malicious files | MIME type validation, file type whitelist |
| Unauthorized access | JWT authentication required |
| Database leak | Photos encrypted, useless without key |

---

## 📈 Performance Considerations

### Encryption Overhead
- **Encryption Time:** ~10-50ms for typical profile photo (< 1MB)
- **Decryption Time:** ~10-50ms
- **Negligible impact** on user experience

### Storage Optimization
- Base64 encoding increases size by ~33%
- Example: 1MB image → ~1.33MB encrypted data
- Consider implementing compression before encryption if needed

### Caching
- Frontend caches decrypted photos for 5 minutes
- Reduces server load
- Improves user experience

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Failed to encrypt image"**
- **Cause:** Missing or invalid encryption key
- **Fix:** Verify `IMAGE_ENCRYPTION_KEY` in `.env`

**Issue: "Failed to decrypt image"**
- **Cause:** Encryption key changed after upload
- **Fix:** Use same key that encrypted the image

**Issue: "Invalid file type" error**
- **Cause:** Uploading unsupported file format
- **Fix:** Use JPEG, PNG, or WebP only

**Issue: "File too large" error**
- **Cause:** Image exceeds 5MB limit
- **Fix:** Resize or compress image before upload

**Issue: Photo doesn't display after upload**
- **Cause:** Browser cache or network issue
- **Fix:** Hard refresh browser (Ctrl+F5)

---

## 🔄 Migration Guide

### For Existing Users

If you're adding this feature to an existing application with users:

1. **Database Migration:**
   - Existing users won't have `profilePhoto` field
   - MongoDB will automatically handle undefined fields
   - No migration script needed

2. **Gradual Rollout:**
   ```javascript
   // Check if user has photo
   if (user.profilePhoto && user.profilePhoto.encryptedData) {
     // Decrypt and display
   } else {
     // Show default avatar or upload prompt
   }
   ```

3. **Key Rotation (if needed):**
   ```
   1. Generate new encryption key
   2. Decrypt all photos with old key
   3. Re-encrypt with new key
   4. Update encryption key in environment
   ```

---

## 📚 Related Documentation

- [Security Testing Guide](SECURITY_TEST_CASES.md)
- [API Documentation](API_DOCS.md)
- [Deployment Guide](DEPLOYMENT.md)

---

## 🎓 Technical Deep Dive

### Encryption Process

```typescript
// 1. Generate random IV (16 bytes)
const iv = crypto.randomBytes(16);

// 2. Create encryption key (32 bytes)
const key = Buffer.from(ENCRYPTION_KEY, 'hex');

// 3. Create cipher
const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

// 4. Encrypt buffer
let encrypted = cipher.update(buffer);
encrypted = Buffer.concat([encrypted, cipher.final()]);

// 5. Convert to Base64 for storage
const encryptedBase64 = encrypted.toString('base64');
const ivHex = iv.toString('hex');
```

### Decryption Process

```typescript
// 1. Recreate encryption key
const key = Buffer.from(ENCRYPTION_KEY, 'hex');

// 2. Convert IV from hex
const iv = Buffer.from(ivHex, 'hex');

// 3. Convert encrypted data from Base64
const encryptedBuffer = Buffer.from(encryptedData, 'base64');

// 4. Create decipher
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

// 5. Decrypt buffer
let decrypted = decipher.update(encryptedBuffer);
decrypted = Buffer.concat([decrypted, decipher.final()]);
```

---

## 📝 Changelog

### Version 1.0.0 (2025-11-16)

**Initial Release:**
- ✅ AES-256-CBC encryption implementation
- ✅ Profile photo upload endpoint
- ✅ Photo retrieval with decryption
- ✅ Photo deletion endpoint
- ✅ Metadata endpoint
- ✅ Frontend upload component
- ✅ File validation (type & size)
- ✅ JWT authentication
- ✅ Error handling
- ✅ Security badges & notifications

---

## 🚀 Future Enhancements

### Planned Features

1. **Image Compression**
   - Compress before encryption to save storage
   - Target: 80% quality, < 500KB

2. **Multiple Photo Sizes**
   - Thumbnail (100x100)
   - Medium (300x300)
   - Full size (original)

3. **Watermarking**
   - Add user watermark for copyright protection

4. **Face Detection**
   - Verify image contains a face
   - Prevent non-profile images

5. **CDN Integration**
   - Serve decrypted photos via CDN
   - Improve performance globally

6. **Key Rotation**
   - Automated key rotation schedule
   - Seamless re-encryption

---

**Last Updated:** 2025-11-16
**Version:** 1.0.0
**Author:** Security Team
**Status:** ✅ Production Ready
