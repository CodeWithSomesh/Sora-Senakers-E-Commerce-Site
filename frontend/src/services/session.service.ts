const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export interface SessionStatus {
  isValid: boolean;
  expiresAt: string;
  timeRemaining: number; // in seconds
  lastActivity: string;
}

/**
 * Keep the session alive (refresh timeout)
 */
export const keepSessionAlive = async (accessToken: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/keep-alive`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.sessionExpired) {
        throw new Error("SESSION_EXPIRED");
      }
      throw new Error(`Failed to keep session alive: ${response.status}`);
    }
  } catch (error) {
    console.error("Keep session alive error:", error);
    throw error;
  }
};

/**
 * Get current session status
 */
export const getSessionStatus = async (accessToken: string): Promise<SessionStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const data = await response.json();
      if (data.sessionExpired) {
        throw new Error("SESSION_EXPIRED");
      }
      throw new Error(`Failed to get session status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Get session status error:", error);
    throw error;
  }
};

/**
 * Destroy the current session (logout)
 */
export const destroySession = async (accessToken: string): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/session`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Destroy session error:", error);
    // Don't throw - we want to logout even if this fails
  }
};
