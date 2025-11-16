import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.IMAGE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

/**
 * Encrypts image buffer data using AES-256-CBC
 * @param buffer - Image buffer to encrypt
 * @returns Object containing encrypted data and IV
 */
export const encryptImage = (buffer: Buffer): { encrypted: string; iv: string } => {
  try {
    // Generate initialization vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create encryption key from hex string
    const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the buffer
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('Image encryption error:', error);
    throw new Error('Failed to encrypt image');
  }
};

/**
 * Decrypts encrypted image data back to buffer
 * @param encryptedData - Base64 encoded encrypted data
 * @param ivHex - Hexadecimal initialization vector
 * @returns Decrypted image buffer
 */
export const decryptImage = (encryptedData: string, ivHex: string): Buffer => {
  try {
    // Create decryption key from hex string
    const key = Buffer.from(ENCRYPTION_KEY.substring(0, 64), 'hex');

    // Convert IV from hex
    const iv = Buffer.from(ivHex, 'hex');

    // Convert encrypted data from base64
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Decrypt the buffer
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
  } catch (error) {
    console.error('Image decryption error:', error);
    throw new Error('Failed to decrypt image');
  }
};

/**
 * Validates that the encryption key is properly configured
 * @returns true if encryption key is valid
 */
export const validateEncryptionKey = (): boolean => {
  if (!process.env.IMAGE_ENCRYPTION_KEY) {
    console.warn('⚠️  IMAGE_ENCRYPTION_KEY not set in .env - using temporary key');
    console.warn('⚠️  Add IMAGE_ENCRYPTION_KEY to .env for production use');
    return false;
  }

  if (process.env.IMAGE_ENCRYPTION_KEY.length < 64) {
    console.error('❌ IMAGE_ENCRYPTION_KEY must be at least 64 characters (hex)');
    return false;
  }

  return true;
};

/**
 * Generates a new encryption key (for setup purposes)
 * @returns Hexadecimal encryption key
 */
export const generateEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
