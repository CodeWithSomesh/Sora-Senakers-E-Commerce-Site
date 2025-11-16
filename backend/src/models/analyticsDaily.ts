import mongoose from "mongoose";

const topProductSchema = new mongoose.Schema({
    productId: String,
    name: String,
    views: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
}, { _id: false });

const analyticsDailySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true,
        index: true,
    },
    totalUsers: {
        type: Number,
        default: 0,
    },
    totalSessions: {
        type: Number,
        default: 0,
    },
    totalPurchases: {
        type: Number,
        default: 0,
    },
    totalRevenue: {
        type: Number,
        default: 0,
    },
    topProducts: [topProductSchema],
}, {
    timestamps: true,
});

// Index for faster date-based queries
analyticsDailySchema.index({ date: -1 });

const AnalyticsDaily = mongoose.model("AnalyticsDaily", analyticsDailySchema);
export default AnalyticsDaily;
