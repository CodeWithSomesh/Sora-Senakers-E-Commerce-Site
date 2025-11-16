import { SecurityMetrics } from "../../types/security.types";
import { Shield, AlertTriangle, Activity, Ban } from "lucide-react";

/**
 * SECURITY METRICS CARDS COMPONENT
 *
 * Purpose: Display real-time security metrics on the dashboard
 * Security Benefits:
 * - Provides at-a-glance view of security posture
 * - Highlights potential security threats immediately
 * - Enables quick response to security incidents
 * - Uses color coding to indicate severity
 */

interface SecurityMetricsCardsProps {
  metrics: SecurityMetrics;
}

export const SecurityMetricsCards = ({ metrics }: SecurityMetricsCardsProps) => {
  const securityStats = [
    {
      title: "Failed Login Attempts",
      value: metrics.failedLoginCount,
      flagged: metrics.flaggedLogins,
      icon: Shield,
      color: metrics.flaggedLogins > 0 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600",
      description: "Last 24 hours",
      securityNote: "Monitors brute-force attempts",
    },
    {
      title: "Flagged Transactions",
      value: metrics.flaggedTransactions,
      icon: AlertTriangle,
      color: metrics.flaggedTransactions > 0 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600",
      description: "Today",
      securityNote: "Detects potential fraud",
    },
    {
      title: "Admin Actions",
      value: metrics.adminActionCount,
      icon: Activity,
      color: "bg-purple-100 text-purple-600",
      description: "Today",
      securityNote: "Tracks privileged operations",
    },
    {
      title: "Suspicious IPs",
      value: metrics.blockedIPs,
      icon: Ban,
      color: metrics.blockedIPs > 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600",
      description: "Multiple accounts detected",
      securityNote: "Identifies account abuse",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Security Monitoring Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Real-time security metrics help identify and prevent potential threats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                {stat.flagged !== undefined && stat.flagged > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {stat.flagged} flagged
                  </span>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mb-2">{stat.description}</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {stat.securityNote}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
