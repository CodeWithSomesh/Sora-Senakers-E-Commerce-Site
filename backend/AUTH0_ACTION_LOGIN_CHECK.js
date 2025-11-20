/**
 * AUTH0 ACTION: Pre-Login Database Block Check
 *
 * PURPOSE: This Auth0 Action checks your database to see if a user is blocked
 * before allowing them to log in. This ensures blocking in your database
 * immediately prevents Auth0 logins.
 *
 * INSTALLATION INSTRUCTIONS:
 *
 * 1. Go to Auth0 Dashboard: https://manage.auth0.com/
 * 2. Navigate to: Actions > Library
 * 3. Click "Build Custom"
 * 4. Name: "Check Database Block Status"
 * 5. Trigger: "Login / Post Login"
 * 6. Copy the code below into the editor
 * 7. Add Secret:
 *    - Key: API_BASE_URL
 *    - Value: http://localhost:7000 (or your production URL)
 * 8. Click "Deploy"
 * 9. Go to: Actions > Flows > Login
 * 10. Drag "Check Database Block Status" action into the flow
 * 11. Click "Apply"
 *
 * WHAT THIS DOES:
 * - On every login attempt, calls your backend API
 * - Checks if user's isActive field is false
 * - If blocked in database, denies login with message
 * - Logs the blocked attempt for security tracking
 */

exports.onExecutePostLogin = async (event, api) => {
  const axios = require('axios');

  try {
    // Get user's auth0Id (sub) and email
    const auth0Id = event.user.user_id;
    const email = event.user.email;

    // Call your backend API to check if user is blocked
    const response = await axios.get(
      `${event.secrets.API_BASE_URL}/api/admin/users/check-block-status`,
      {
        params: { auth0Id }
      }
    );

    // If user is blocked in database, deny login
    if (response.data.isBlocked) {
      // Track this blocked login attempt
      try {
        await axios.post(
          `${event.secrets.API_BASE_URL}/api/security/failed-login`,
          {
            username: email,
            email: email,
            reason: 'account_locked'
          }
        );
      } catch (trackError) {
        console.error('Failed to track blocked login:', trackError.message);
      }

      // Deny access with message
      api.access.deny('Your account has been blocked. Please contact support.');
    }

  } catch (error) {
    console.error('Error checking block status:', error.message);
    // On error, allow login to proceed (fail open)
    // You can change this to api.access.deny() for fail closed
  }
};
