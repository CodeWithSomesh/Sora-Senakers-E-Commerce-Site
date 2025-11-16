import express from "express";
import multer from "multer";
import { jwtCheck, jwtParse } from "../middleware/auth";
import {
  uploadProfilePhoto,
  getProfilePhoto,
  deleteProfilePhoto,
  getPhotoMetadata
} from "../controllers/PhotoController";

const router = express.Router();

// Configure multer for memory storage (we'll encrypt before saving)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed'));
    }
  },
});

// Upload encrypted profile photo
router.post(
  "/",
  jwtCheck,
  jwtParse,
  upload.single('profilePhoto'),
  uploadProfilePhoto
);

// Get decrypted profile photo
router.get(
  "/",
  jwtCheck,
  jwtParse,
  getProfilePhoto
);

// Delete profile photo
router.delete(
  "/",
  jwtCheck,
  jwtParse,
  deleteProfilePhoto
);

// Get photo metadata
router.get(
  "/metadata",
  jwtCheck,
  jwtParse,
  getPhotoMetadata
);

export default router;
