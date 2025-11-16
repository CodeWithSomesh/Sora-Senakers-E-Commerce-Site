export type EventType =
  | "login"
  | "logout"
  | "signup"
  | "view_product"
  | "add_to_cart"
  | "purchase"
  | "page_view";

export interface AnalyticsEvent {
  id: string;
  eventType: EventType;
  userId: string | null;
  timestamp: Date;
  data: Record<string, any>;
}

export interface TopProduct {
  productId: string;
  productName: string;
  views: number;
  purchases: number;
}

export interface EventCount {
  eventType: EventType;
  count: number;
}

export interface TodayStats {
  totalUsers: number;
  totalSessions: number;
  totalRevenue: number;
  totalOrders: number;
}

export interface DashboardData {
  activeUsers: number;
  todayStats: TodayStats;
  recentEvents: AnalyticsEvent[];
  topProducts: TopProduct[];
  eventCounts: EventCount[];
}

export interface TrackEventPayload {
  eventType: EventType;
  userId?: string | null;
  data?: Record<string, any>;
}
