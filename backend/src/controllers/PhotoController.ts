import { Request, Response } from "express";
import User from "../models/user";
import { encryptImage, decryptImage, validateEncryptionKey } from "../utils/imageEncryption";

/**
 * Upload and encrypt user profile photo
 * POST /api/my/user/photo
 */
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    // Validate encryption key is configured
    validateEncryptionKey();

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No photo file provided" });
    }

    // Validate file type (only images allowed)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed"
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({
        error: "File too large. Maximum size is 5MB"
      });
    }

    // Encrypt the image buffer
    const { encrypted, iv } = encryptImage(req.file.buffer);

    // Find and update user with encrypted photo data
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Store encrypted photo data in database
    user.profilePhoto = {
      encryptedData: encrypted,
      iv: iv,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };

    await user.save();

    res.status(200).json({
      message: "Profile photo uploaded and encrypted successfully",
      uploadedAt: user.profilePhoto.uploadedAt,
    });

  } catch (error: any) {
    console.error("Photo upload error:", error);
    res.status(500).json({
      error: "Failed to upload photo",
      message: error.message
    });
  }
};

/**
 * Get and decrypt user profile photo
 * GET /api/my/user/photo
 */
export const getProfilePhoto = async (req: Request, res: Response) => {
  try {
    // Find user with photo data
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has a profile photo
    if (!user.profilePhoto || !user.profilePhoto.encryptedData || !user.profilePhoto.iv) {
      return res.status(404).json({ error: "No profile photo found" });
    }

    // Decrypt the image
    const decryptedBuffer = decryptImage(
      user.profilePhoto.encryptedData,
      user.profilePhoto.iv
    );

    // Set appropriate headers and send decrypted image
    res.setHeader('Content-Type', user.profilePhoto.mimeType || 'image/jpeg');
    res.setHeader('Content-Length', decryptedBuffer.length);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache for 1 hour

    res.send(decryptedBuffer);

  } catch (error: any) {
    console.error("Photo retrieval error:", error);
    res.status(500).json({
      error: "Failed to retrieve photo",
      message: error.message
    });
  }
};

/**
 * Delete user profile photo
 * DELETE /api/my/user/photo
 */
export const deleteProfilePhoto = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove photo data
    user.profilePhoto = undefined;
    await user.save();

    res.status(200).json({ message: "Profile photo deleted successfully" });

  } catch (error: any) {
    console.error("Photo deletion error:", error);
    res.status(500).json({
      error: "Failed to delete photo",
      message: error.message
    });
  }
};

/**
 * Get photo metadata (without decrypting the image)
 * GET /api/my/user/photo/metadata
 */
export const getPhotoMetadata = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.profilePhoto || !user.profilePhoto.encryptedData) {
      return res.status(404).json({ error: "No profile photo found" });
    }

    res.status(200).json({
      hasPhoto: true,
      mimeType: user.profilePhoto.mimeType,
      uploadedAt: user.profilePhoto.uploadedAt,
      encrypted: true,
    });

  } catch (error: any) {
    console.error("Photo metadata error:", error);
    res.status(500).json({
      error: "Failed to get photo metadata",
      message: error.message
    });
  }
};
