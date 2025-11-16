import mongoose from "mongoose";

/**
 * SECURITY LOG MODEL
 *
 * Purpose: Track all security-related events across the e-commerce platform
 * Security Benefits:
 * - Provides audit trail for security incidents
 * - Enables detection of suspicious patterns
 * - Helps in forensic analysis after security breaches
 * - Allows monitoring of security posture over time
 */

const securityLogSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true,
        enum: [
            "failed_login",           // Failed authentication attempt
            "successful_login",       // Successful user login
            "password_reset_request", // Password reset initiated
            "account_locked",         // Account locked due to failed attempts
            "suspicious_activity",    // Flagged suspicious behavior
            "admin_action",          // Administrative action performed
            "high_value_purchase",   // Purchase exceeding threshold
            "rapid_checkout",        // Fast checkout (potential fraud)
            "ip_flagged",           // IP address flagged
            "multiple_accounts"      // Multiple accounts from same IP
        ],
        index: true,
    },
    userId: {
        type: String,
        default: null,
        index: true,
    },
    username: {
        type: String,
        default: null,
    },
    ipAddress: {
        type: String,
        required: true,
        index: true, // Index for IP-based queries
    },
    userAgent: {
        type: String,
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "low",
        index: true,
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
    resolved: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Compound indexes for common security queries
securityLogSchema.index({ eventType: 1, timestamp: -1 });
securityLogSchema.index({ ipAddress: 1, timestamp: -1 });
securityLogSchema.index({ severity: 1, resolved: 1, timestamp: -1 });

const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);
export default SecurityLog;
