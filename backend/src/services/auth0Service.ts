import axios from "axios";
import FailedLogin from "../models/failedLogin";
import User from "../models/user";
import SecurityLog from "../models/securityLog";

/**
 * AUTH0 MANAGEMENT API SERVICE
 * Handles integration with Auth0 Management API for user management and security tracking
 */

interface Auth0User {
  user_id: string;
  email: string;
  blocked: boolean;
}

interface Auth0Log {
  type: string;
  date: string;
  user_name?: string;
  user_id?: string;
  connection?: string;
  ip?: string;
  user_agent?: string;
  description?: string;
}

/**
 * Get Auth0 Management API access token
 * This token is required for all Auth0 Management API calls
 */
export const getAuth0ManagementToken = async (): Promise<string> => {
  try {
    const response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
        client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get Auth0 management token:", error);
    throw new Error("Failed to authenticate with Auth0 Management API");
  }
};

/**
 * Get user from Auth0 by auth0Id
 */
export const getAuth0User = async (auth0Id: string): Promise<Auth0User> => {
  const token = await getAuth0ManagementToken();

  try {
    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(auth0Id)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to get Auth0 user:", error);
    throw new Error("Failed to fetch user from Auth0");
  }
};

/**
 * Block user in Auth0
 */
export const blockAuth0User = async (auth0Id: string): Promise<void> => {
  const token = await getAuth0ManagementToken();

  try {
    await axios.patch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(auth0Id)}`,
      { blocked: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to block Auth0 user:", error);
    throw new Error("Failed to block user in Auth0");
  }
};

/**
 * Unblock user in Auth0
 */
export const unblockAuth0User = async (auth0Id: string): Promise<void> => {
  const token = await getAuth0ManagementToken();

  try {
    await axios.patch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(auth0Id)}`,
      { blocked: false },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Failed to unblock Auth0 user:", error);
    throw new Error("Failed to unblock user in Auth0");
  }
};

/**
 * Fetch failed login attempts from Auth0 logs
 * This syncs Auth0's failed login tracking with our database
 *
 * Auth0 Log Types for Failed Logins:
 * - 'f' or 'fp': Failed login (wrong password)
 * - 'fu': Failed login (invalid username/email)
 * - 'limit_wc': Blocked account (too many login attempts)
 */
export const syncAuth0FailedLogins = async (): Promise<void> => {
  const token = await getAuth0ManagementToken();

  try {
    console.log("🔄 Starting Auth0 failed login sync...");

    // Fetch logs from last 24 hours
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const response = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/logs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: `type:(f OR fp OR fu OR limit_wc)`,
          per_page: 100,
          sort: "date:-1",
        },
      }
    );

    const logs: Auth0Log[] = response.data;
    console.log(`📋 Fetched ${logs.length} log entries from Auth0`);

    if (!logs || logs.length === 0) {
      console.log("ℹ️  No failed login logs found in Auth0");
      return;
    }

    // STEP 1: Import all failed login records first
    let newLogsCount = 0;
    const emailsWithFailures = new Set<string>();

    for (const log of logs) {
      const email = log.user_name || log.user_id || "unknown";

      // Check if we already have this exact log entry
      const existingLog = await FailedLogin.findOne({
        email: email,
        timestamp: new Date(log.date),
      });

      // Skip if already recorded
      if (existingLog) {
        console.log(`⏭️  Skipping duplicate log for ${email} at ${log.date}`);
        continue;
      }

      // Determine the reason for failure
      let reason: "invalid_credentials" | "account_not_found" | "account_locked" = "invalid_credentials";
      if (log.type === "fu") reason = "account_not_found";
      if (log.type === "limit_wc") reason = "account_locked";

      // Count total attempts for this email (including the one we're about to add)
      const recentAttempts = await FailedLogin.countDocuments({
        email: email,
        timestamp: { $gte: twentyFourHoursAgo },
      });

      // Create failed login record
      await FailedLogin.create({
        username: email,
        email: email,
        ipAddress: log.ip || "unknown",
        userAgent: log.user_agent || "unknown",
        attemptCount: recentAttempts + 1,
        timestamp: new Date(log.date),
        reason,
        flagged: (recentAttempts + 1) >= 3, // Flag if this is 3rd or more
      });

      newLogsCount++;
      emailsWithFailures.add(email);
      console.log(`✅ Created FailedLogin record for ${email} (attempt #${recentAttempts + 1})`);
    }

    console.log(`📝 Imported ${newLogsCount} new failed login records`);

    // STEP 2: Now check each unique email and block users with 3+ failed attempts
    console.log(`🔍 Checking ${emailsWithFailures.size} unique emails for blocking...`);

    for (const email of emailsWithFailures) {
      // Count total failed attempts in last 24 hours for this email
      const totalAttempts = await FailedLogin.countDocuments({
        email: email,
        timestamp: { $gte: twentyFourHoursAgo },
      });

      console.log(`📊 User ${email} has ${totalAttempts} failed attempts in last 24 hours`);

      // If 3 or more attempts, block the user
      if (totalAttempts >= 3) {
        try {
          const user = await User.findOne({ email: email });

          if (!user) {
            console.log(`⚠️  User with email ${email} not found in database`);
            continue;
          }

          if (user.isBlocked) {
            console.log(`ℹ️  User ${email} is already blocked`);
            continue;
          }

          console.log(`🚫 Blocking user ${email} due to ${totalAttempts} failed attempts`);

          // Block user in database
          user.isBlocked = true;
          await user.save();

          console.log(`✅ Set isBlocked = true for user ${email} in database`);

          // Also block in Auth0 (if not already blocked)
          try {
            await blockAuth0User(user.auth0Id);
            console.log(`✅ Blocked user ${email} in Auth0`);
          } catch (auth0Error) {
            console.error(`❌ Failed to block user in Auth0:`, auth0Error);
          }

          // Log the account lock event
          await SecurityLog.create({
            eventType: "account_locked",
            userId: user._id.toString(),
            username: user.email,
            severity: "critical",
            details: {
              reason: "Automatic lock due to 3+ failed login attempts (synced from Auth0)",
              attemptCount: totalAttempts,
              syncedAt: new Date(),
            },
          });

          console.log(`📋 Created security log for user ${email}`);
        } catch (error) {
          console.error(`❌ Failed to block user ${email}:`, error);
        }
      }
    }

    console.log(`✅ Successfully completed Auth0 sync`);
  } catch (error: any) {
    console.error("❌ Failed to sync Auth0 failed logins:", error.response?.data || error.message);
    throw new Error("Failed to sync failed logins from Auth0");
  }
};

/**
 * Check if user is blocked in Auth0
 */
export const isUserBlockedInAuth0 = async (auth0Id: string): Promise<boolean> => {
  try {
    const user = await getAuth0User(auth0Id);
    return user.blocked || false;
  } catch (error) {
    console.error("Failed to check if user is blocked in Auth0:", error);
    return false;
  }
};
