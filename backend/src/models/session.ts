import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    lastActivity: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL index - MongoDB will auto-delete expired sessions
    },
    ipAddress: {
        type: String,
    },
    userAgent: {
        type: String,
    },
}, {
    timestamps: true,
});

// Index for faster lookups
sessionSchema.index({ userId: 1, token: 1 });
sessionSchema.index({ expiresAt: 1 });

const Session = mongoose.model("Session", sessionSchema);
export default Session;
