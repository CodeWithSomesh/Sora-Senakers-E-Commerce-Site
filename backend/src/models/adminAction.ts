import mongoose from "mongoose";

/**
 * ADMIN ACTION MODEL
 *
 * Purpose: Audit trail for all administrative actions
 * Security Benefits:
 * - Provides accountability for privileged operations
 * - Detects unauthorized administrative access
 * - Enables rollback in case of malicious changes
 * - Supports compliance with audit requirements
 * - Identifies insider threats
 */

const adminActionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    adminUsername: {
        type: String,
        required: true,
    },
    actionType: {
        type: String,
        required: true,
        enum: [
            "product_added",
            "product_edited",
            "product_deleted",
            "order_status_changed",
            "user_role_changed",
            "settings_modified",
            "bulk_operation",
            "data_export",
            "user_deleted",
            "security_settings_changed"
        ],
        index: true,
    },
    targetType: {
        type: String,
        enum: ["product", "order", "user", "settings", "system"],
        required: true,
    },
    targetId: {
        type: String, // ID of the affected item (product, order, etc.)
    },
    targetName: {
        type: String, // Name/description of the affected item
    },
    changes: {
        type: mongoose.Schema.Types.Mixed, // Before/after values
        default: {},
    },
    ipAddress: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
    status: {
        type: String,
        enum: ["success", "failed", "partial"],
        default: "success",
    },
}, {
    timestamps: true,
});

// Compound indexes for efficient admin activity queries
adminActionSchema.index({ adminId: 1, timestamp: -1 });
adminActionSchema.index({ actionType: 1, timestamp: -1 });
adminActionSchema.index({ targetType: 1, timestamp: -1 });

const AdminAction = mongoose.model("AdminAction", adminActionSchema);
export default AdminAction;
