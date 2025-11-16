/**
 * SECURITY ANALYTICS TYPE DEFINITIONS
 * For academic demonstration of security monitoring in e-commerce
 */

export interface FailedLoginAttempt {
  id: string;
  username: string;
  email?: string;
  ipAddress: string;
  timestamp: Date;
  attemptCount: number;
  flagged: boolean;
  reason: string;
}

export interface AdminAction {
  id: string;
  adminUsername: string;
  actionType: string;
  targetType: string;
  targetName?: string;
  timestamp: Date;
  status: string;
}

export interface SuspiciousActivity {
  id: string;
  eventType: string;
  username?: string;
  ipAddress: string;
  severity: "low" | "medium" | "high" | "critical";
  details: Record<string, any>;
  timestamp: Date;
}

export interface SecurityMetrics {
  failedLoginCount: number;
  flaggedLogins: number;
  flaggedTransactions: number;
  adminActionCount: number;
  suspiciousActivityCount: number;
  blockedIPs: number;
}

export interface IPActivity {
  ipAddress: string;
  userCount: number;
  loginCount: number;
}

export interface LoginComparison {
  successful: number;
  failed: number;
}

export interface SecurityEventCount {
  eventType: string;
  count: number;
}

export interface SecurityDashboardData {
  metrics: SecurityMetrics;
  failedLogins: FailedLoginAttempt[];
  adminActions: AdminAction[];
  suspiciousActivities: SuspiciousActivity[];
  multipleAccountsFromIP: IPActivity[];
  securityEventCounts: SecurityEventCount[];
  loginComparison: LoginComparison;
}
