import { SecurityDashboardData } from "../types/security.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

/**
 * SECURITY ANALYTICS SERVICE
 * Handles all security-related API calls
 */

/**
 * Track failed login attempt
 * Security Benefit: Records authentication failures for brute-force detection
 */
export const trackFailedLogin = async (username: string, email?: string, reason?: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/security/failed-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, reason }),
    });
  } catch (error) {
    console.error("Failed to track failed login:", error);
  }
};

/**
 * Track admin action
 * Security Benefit: Creates audit trail for administrative operations
 */
export const trackAdminAction = async (
  accessToken: string,
  adminId: string,
  adminUsername: string,
  actionType: string,
  targetType: string,
  targetId?: string,
  targetName?: string,
  changes?: Record<string, any>
): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/security/admin-action`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminId,
        adminUsername,
        actionType,
        targetType,
        targetId,
        targetName,
        changes,
      }),
    });
  } catch (error) {
    console.error("Failed to track admin action:", error);
  }
};

/**
 * Detect suspicious activity
 * Security Benefit: Flags potential fraud and security threats
 */
export const detectSuspiciousActivity = async (
  accessToken: string,
  type: string,
  userId?: string,
  username?: string,
  details?: Record<string, any>
): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/security/suspicious-activity`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        userId,
        username,
        details,
      }),
    });
  } catch (error) {
    console.error("Failed to detect suspicious activity:", error);
  }
};

/**
 * Get security dashboard data
 * Security Benefit: Provides comprehensive security metrics for monitoring
 */
export const getSecurityDashboard = async (accessToken: string): Promise<SecurityDashboardData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/security/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch security dashboard: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to get security dashboard:", error);
    throw error;
  }
};

/**
 * Resolve security alert
 * Security Benefit: Allows admins to mark security issues as handled
 */
export const resolveSecurityAlert = async (accessToken: string, alertId: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/security/alert/${alertId}/resolve`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to resolve security alert:", error);
    throw error;
  }
};
