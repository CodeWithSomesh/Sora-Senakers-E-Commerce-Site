/**
 * AUTH0 ACTION: Track Failed Login Attempts
 *
 * PURPOSE: This Auth0 Action automatically calls your backend API whenever
 * a login fails (wrong password, wrong email, etc.) and tracks it in your database.
 *
 * INSTALLATION INSTRUCTIONS:
 *
 * 1. Go to Auth0 Dashboard: https://manage.auth0.com/
 * 2. Navigate to: Actions > Library
 * 3. Click "Build Custom"
 * 4. Name: "Track Failed Login Attempts"
 * 5. Trigger: "Login / Post Login"
 *    IMPORTANT: Actually use "Login / Post Login" trigger (Auth0 doesn't have a direct "failed login" trigger)
 *
 *    BETTER OPTION: Use "Login / Post Login" for successful logins
 *                   For failed logins, we need to use Log Streams instead
 *
 * Actually, for tracking FAILED logins, we need a different approach:
 * Use "Pre User Registration" or configure Auth0 Log Streams
 *
 * Let me create the correct version below:
 */

/**
 * CORRECT APPROACH: Use Auth0 Log Streams
 *
 * Auth0 doesn't have a "Post Failed Login" hook, so we need to:
 * 1. Set up Log Streams to send failed login events to your API
 * 2. OR use Management API to periodically fetch logs
 * 3. OR track on the Auth0 Universal Login Page (not recommended)
 *
 * RECOMMENDED: Custom Login Page with Tracking
 *
 * Add this JavaScript to your Auth0 Universal Login Page:
 */

// ============================================================================
// ADD THIS TO AUTH0 UNIVERSAL LOGIN PAGE
// Dashboard > Branding > Universal Login > Advanced Options > Login
// ============================================================================

/*
<script>
  // Override the default form submission to track failed logins
  const webAuth = new auth0.WebAuth({
    domain: config.auth0Domain,
    clientID: config.clientID,
    redirectUri: config.callbackURL,
    responseType: 'code'
  });

  // Track failed login
  async function trackFailedLogin(username, reason) {
    try {
      await fetch('http://localhost:7000/api/security/failed-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: username,
          reason: reason
        })
      });
    } catch (error) {
      console.error('Failed to track login attempt:', error);
    }
  }

  // Intercept login attempt
  document.getElementById('btn-login').addEventListener('click', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    webAuth.login({
      realm: config.internalOptions.realm || 'Username-Password-Authentication',
      username: username,
      password: password
    }, function(err, authResult) {
      if (err) {
        // Track failed login
        let reason = 'invalid_credentials';
        if (err.code === 'invalid_user_password' || err.code === 'invalid_username_password') {
          reason = 'invalid_credentials';
        } else if (err.code === 'user_not_found') {
          reason = 'account_not_found';
        } else if (err.code === 'too_many_attempts' || err.code === 'blocked_user') {
          reason = 'account_locked';
        }

        trackFailedLogin(username, reason);

        // Show error to user
        document.getElementById('error-message').textContent = err.description || 'Login failed';
        document.getElementById('error-message').style.display = 'block';
      }
    });
  });
</script>
*/

// ============================================================================
// BETTER SOLUTION: Auth0 Post-Login Action that checks login count
// ============================================================================

/**
 * This action runs AFTER successful login and can check if user had failed attempts
 * Then it syncs those to your database
 */

exports.onExecutePostLogin = async (event, api) => {
  const axios = require('axios');

  // This only runs on successful login
  // We can't directly track failed logins here

  // However, we can call your sync endpoint to pull recent Auth0 logs
  try {
    // Trigger sync of Auth0 logs (including failed attempts)
    await axios.post(
      `${event.secrets.API_BASE_URL}/api/security/sync-auth0-logs`,
      {},
      {
        headers: {
          'X-Auth0-Sync': 'true' // Internal sync trigger
        }
      }
    );
  } catch (error) {
    console.error('Failed to sync Auth0 logs:', error.message);
  }
};
