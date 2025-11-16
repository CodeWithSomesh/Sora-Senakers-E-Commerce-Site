import mongoose from "mongoose";

/**
 * FAILED LOGIN MODEL
 *
 * Purpose: Track failed authentication attempts to detect brute-force attacks
 * Security Benefits:
 * - Identifies potential account compromise attempts
 * - Enables account lockout after multiple failures
 * - Detects credential stuffing attacks
 * - Provides early warning of unauthorized access attempts
 */

const failedLoginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true,
    },
    email: {
        type: String,
        index: true,
    },
    ipAddress: {
        type: String,
        required: true,
        index: true,
    },
    userAgent: {
        type: String,
    },
    attemptCount: {
        type: Number,
        default: 1,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
    reason: {
        type: String,
        enum: [
            "invalid_credentials",
            "account_not_found",
            "account_locked",
            "invalid_token",
            "expired_token"
        ],
        default: "invalid_credentials",
    },
    flagged: {
        type: Boolean,
        default: false, // Set to true if 3+ attempts detected
        index: true,
    },
}, {
    timestamps: true,
});

// Compound indexes for security queries
failedLoginSchema.index({ username: 1, timestamp: -1 });
failedLoginSchema.index({ ipAddress: 1, timestamp: -1 });
failedLoginSchema.index({ flagged: 1, timestamp: -1 });

// TTL Index: Auto-delete records older than 30 days to maintain database performance
failedLoginSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const FailedLogin = mongoose.model("FailedLogin", failedLoginSchema);
export default FailedLogin;
