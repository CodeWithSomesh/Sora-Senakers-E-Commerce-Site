import { TrackEventPayload, DashboardData } from "../types/analytics.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

/**
 * Track an analytics event
 */
export const trackEvent = async (payload: TrackEventPayload): Promise<void> => {
  try {
    await fetch(`${API_BASE_URL}/api/analytics/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: payload.eventType,
        userId: payload.userId || null,
        data: payload.data || {},
        timestamp: new Date(),
      }),
    });
  } catch (error) {
    console.error("Failed to track event:", error);
    // Don't throw - analytics failures shouldn't break the app
  }
};

/**
 * Get dashboard analytics data
 */
export const getDashboardData = async (accessToken: string): Promise<DashboardData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to get dashboard data:", error);
    throw error;
  }
};

/**
 * Helper functions for common events
 */

export const trackLogin = (userId: string, username: string) => {
  trackEvent({
    eventType: "login",
    userId,
    data: { username },
  });
};

export const trackLogout = (userId: string, sessionDuration?: number) => {
  trackEvent({
    eventType: "logout",
    userId,
    data: { sessionDuration },
  });
};

export const trackSignup = (userId: string, username: string) => {
  trackEvent({
    eventType: "signup",
    userId,
    data: { username },
  });
};

export const trackProductView = (productId: string, productName: string, price: number, userId?: string) => {
  trackEvent({
    eventType: "view_product",
    userId: userId || null,
    data: { productId, productName, price },
  });
};

export const trackAddToCart = (productId: string, quantity: number, price: number, userId?: string) => {
  trackEvent({
    eventType: "add_to_cart",
    userId: userId || null,
    data: { productId, quantity, price },
  });
};

export const trackPurchase = (orderId: string, totalAmount: number, itemCount: number, userId?: string) => {
  trackEvent({
    eventType: "purchase",
    userId: userId || null,
    data: { orderId, totalAmount, itemCount },
  });
};

export const trackPageView = (pagePath: string, pageTitle: string, userId?: string) => {
  trackEvent({
    eventType: "page_view",
    userId: userId || null,
    data: { pagePath, pageTitle },
  });
};
