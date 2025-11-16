import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        required: true,
        enum: [
            "login",
            "logout",
            "signup",
            "view_product",
            "add_to_cart",
            "purchase",
            "page_view"
        ],
    },
    userId: {
        type: String,
        default: null,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true,
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: false,
});

// Indexes for faster queries
analyticsEventSchema.index({ timestamp: -1 });
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, timestamp: -1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);
export default AnalyticsEvent;
