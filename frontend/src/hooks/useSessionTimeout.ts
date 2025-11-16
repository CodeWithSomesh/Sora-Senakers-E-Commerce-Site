import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { keepSessionAlive } from "../services/session.service";

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_TIME = 13 * 60 * 1000; // 13 minutes - show warning at this point

/**
 * Hook to manage session timeout with warning modal
 * Automatically logs out user after 15 minutes of inactivity
 * Shows warning modal at 13 minutes
 */
export const useSessionTimeout = () => {
  const { isAuthenticated, logout, getAccessTokenSilently } = useAuth0();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(SESSION_TIMEOUT);

  const lastActivityRef = useRef<number>(Date.now());
  const warningTimerRef = useRef<NodeJS.Timeout>();
  const logoutTimerRef = useRef<NodeJS.Timeout>();
  const activityCheckRef = useRef<NodeJS.Timeout>();

  /**
   * Reset the inactivity timer (without calling API)
   */
  const resetTimerOnly = useCallback(() => {
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();
    setShowWarning(false);

    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // Set warning timer (13 minutes)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, WARNING_TIME);

    // Set logout timer (15 minutes)
    logoutTimerRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT);
  }, [isAuthenticated]);

  /**
   * Reset timer and update session on server
   */
  const resetTimer = useCallback(async () => {
    resetTimerOnly();

    if (!isAuthenticated) return;

    // Try to keep session alive on server
    try {
      const token = await getAccessTokenSilently({ cacheMode: 'off' });
      await keepSessionAlive(token);
    } catch (error) {
      // Silently ignore errors - don't disrupt user experience
      console.log("Session keep-alive skipped:", error);
    }
  }, [isAuthenticated, getAccessTokenSilently, resetTimerOnly]);

  /**
   * Handle user logout
   */
  const handleLogout = useCallback(() => {
    setShowWarning(false);
    // Clear all session data
    localStorage.clear();
    sessionStorage.clear();
    // Logout from Auth0
    logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  }, [logout]);

  /**
   * User clicked "Stay Logged In" button
   */
  const handleStayLoggedIn = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  /**
   * Track user activity
   */
  const trackActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  /**
   * Setup activity listeners
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    events.forEach(event => {
      window.addEventListener(event, trackActivity);
    });

    // Initial timer setup - use resetTimerOnly to avoid API call on mount
    resetTimerOnly();

    // Periodically check time remaining for warning modal
    activityCheckRef.current = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivityRef.current;
      const remaining = SESSION_TIMEOUT - timeSinceActivity;
      setTimeRemaining(remaining);

      // If session has expired
      if (remaining <= 0) {
        handleLogout();
      }
    }, 1000); // Update every second for accurate countdown

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, trackActivity);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (activityCheckRef.current) clearInterval(activityCheckRef.current);
    };
  }, [isAuthenticated, resetTimerOnly, trackActivity, handleLogout]);

  return {
    showWarning,
    timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000)), // in seconds
    handleStayLoggedIn,
    handleLogout,
  };
};
