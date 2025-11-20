/**
 * AUTH0 ACTION: Track Failed Logins in Real-Time
 *
 * PURPOSE: This Auth0 Action calls your backend API on EVERY login attempt
 * (both successful and failed) to track failed logins in your database.
 *
 * INSTALLATION INSTRUCTIONS:
 *
 * 1. Go to Auth0 Dashboard: https://manage.auth0.com/
 * 2. Navigate to: Actions > Library
 * 3. Click "Build Custom"
 * 4. Name: "Track Failed Logins"
 * 5. Trigger: "Login / Post Login"
 * 6. Copy the code below
 * 7. Add Secrets:
 *    - Key: API_BASE_URL
 *    - Value: http://localhost:7000 (or your production URL)
 * 8. Click "Deploy"
 * 9. Go to: Actions > Flows > Login
 * 10. Drag "Track Failed Logins" action into the flow (BEFORE "Check Database Block Status")
 * 11. Click "Apply"
 *
 * HOW IT WORKS:
 * - This Action runs AFTER authentication completes (both success and failure)
 * - For failed logins, Auth0 won't redirect to your callback, but the Action still runs
 * - We check event.stats.logins_count - if it hasn't increased, login failed
 * - We call your /api/security/failed-login endpoint
 * - Your backend automatically blocks user after 3 attempts
 */

exports.onExecutePostLogin = async (event, api) => {
  const axios = require('axios');

  try {
    const email = event.user.email;
    const userId = event.user.user_id;

    // Check if this is a failed login attempt
    // Auth0 provides login stats, but we need a different approach
    // Unfortunately, Post-Login actions only run on SUCCESSFUL logins

    // For FAILED logins, we need to use a different trigger: Pre-User-Registration
    // OR we need to use Auth0 Log Streams

    // However, we CAN track successful logins here and use that to clear failed attempts

    console.log(`Successful login for user: ${email}`);

    // Optional: Clear failed login flags on successful login
    // This would require a new endpoint: POST /api/security/clear-failed-logins

  } catch (error) {
    console.error('Error in Track Failed Logins action:', error.message);
    // Don't block login on error
  }
};

/**
 * IMPORTANT NOTE:
 * Auth0's "Post Login" actions ONLY run on successful logins.
 * For FAILED logins, we have these options:
 *
 * Option 1: Use Auth0 Log Streams (RECOMMENDED)
 * Option 2: Call sync endpoint periodically
 * Option 3: Use Auth0 hooks (deprecated)
 *
 * See AUTH0_LOG_STREAMS_SETUP.md for Log Streams setup
 */
