import cron from "node-cron";
import AnalyticsEvent from "../models/analyticsEvent";
import AnalyticsDaily from "../models/analyticsDaily";

/**
 * Aggregates yesterday's analytics data into daily summary
 * Runs daily at midnight (00:00)
 */
export const startAnalyticsAggregationJob = () => {
  // Run daily at midnight (00:00)
  cron.schedule("0 0 * * *", async () => {
    console.log("Starting daily analytics aggregation...");
    await aggregateYesterdayData();
    await cleanupOldEvents();
    console.log("Daily analytics aggregation completed.");
  });

  console.log("Analytics aggregation cron job started (runs daily at midnight)");
};

/**
 * Aggregate yesterday's data into analytics_daily collection
 */
async function aggregateYesterdayData() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    console.log(`Aggregating data for ${yesterday.toDateString()}`);

    // Get all events from yesterday
    const events = await AnalyticsEvent.find({
      timestamp: { $gte: yesterday, $lte: endOfYesterday }
    });

    if (events.length === 0) {
      console.log("No events to aggregate for yesterday");
      return;
    }

    // Calculate stats
    const uniqueUsers = new Set(
      events.filter(e => e.userId).map(e => e.userId)
    ).size;

    const sessions = events.filter(e => e.eventType === "login").length;

    const purchaseEvents = events.filter(e => e.eventType === "purchase");
    const totalPurchases = purchaseEvents.length;
    const totalRevenue = purchaseEvents.reduce((sum, e) => {
      return sum + (e.data?.totalAmount || 0);
    }, 0);

    // Calculate top products
    const productViews = new Map<string, { name: string; views: number; purchases: number }>();

    events.forEach(event => {
      if (event.eventType === "view_product" || event.eventType === "purchase") {
        const productId = event.data?.productId;
        const productName = event.data?.productName;

        if (productId) {
          if (!productViews.has(productId)) {
            productViews.set(productId, { name: productName || "Unknown", views: 0, purchases: 0 });
          }

          const product = productViews.get(productId)!;
          if (event.eventType === "view_product") {
            product.views++;
          } else if (event.eventType === "purchase") {
            product.purchases++;
          }
        }
      }
    });

    // Convert to array and sort by views
    const topProducts = Array.from(productViews.entries())
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        views: data.views,
        purchases: data.purchases,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10); // Keep top 10

    // Check if daily record already exists
    const existingDaily = await AnalyticsDaily.findOne({ date: yesterday });

    if (existingDaily) {
      // Update existing record
      existingDaily.totalUsers = uniqueUsers;
      existingDaily.totalSessions = sessions;
      existingDaily.totalPurchases = totalPurchases;
      existingDaily.totalRevenue = totalRevenue;
      existingDaily.topProducts = topProducts as any;
      await existingDaily.save();
      console.log(`Updated daily analytics for ${yesterday.toDateString()}`);
    } else {
      // Create new daily record
      await AnalyticsDaily.create({
        date: yesterday,
        totalUsers: uniqueUsers,
        totalSessions: sessions,
        totalPurchases: totalPurchases,
        totalRevenue: totalRevenue,
        topProducts: topProducts,
      });
      console.log(`Created daily analytics for ${yesterday.toDateString()}`);
    }

    console.log(`Aggregated ${events.length} events, ${uniqueUsers} unique users, ${totalRevenue} revenue`);
  } catch (error) {
    console.error("Error aggregating yesterday's data:", error);
  }
}

/**
 * Clean up events older than 30 days
 */
async function cleanupOldEvents() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await AnalyticsEvent.deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });

    console.log(`Deleted ${result.deletedCount} events older than 30 days`);
  } catch (error) {
    console.error("Error cleaning up old events:", error);
  }
}

/**
 * Manual trigger function for testing/debugging
 */
export const manualAggregation = async () => {
  console.log("Manual aggregation triggered");
  await aggregateYesterdayData();
  await cleanupOldEvents();
};
