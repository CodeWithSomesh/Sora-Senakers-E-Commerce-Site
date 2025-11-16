import { SuspiciousActivity as SuspiciousActivityType, IPActivity } from "../../types/security.types";
import { AlertTriangle, Users, DollarSign, Zap, Shield } from "lucide-react";

/**
 * SUSPICIOUS ACTIVITY COMPONENT
 * Displays security warnings and suspicious patterns
 */

interface SuspiciousActivityProps {
  suspiciousActivities: SuspiciousActivityType[];
  multipleAccountsFromIP: IPActivity[];
}

export const SuspiciousActivity = ({ suspiciousActivities, multipleAccountsFromIP }: SuspiciousActivityProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes("high_value")) return DollarSign;
    if (eventType.includes("rapid")) return Zap;
    if (eventType.includes("multiple")) return Users;
    return AlertTriangle;
  };

  const formatEventType = (eventType: string): string => {
    return eventType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-orange-600" />
        <h2 className="text-xl font-bold text-gray-900">Suspicious Activity Detection</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        <strong>Security Benefit:</strong> Identifies potential fraud patterns including high-value purchases,
        rapid checkouts, and multi-account abuse from same IP.
      </p>

      {/* Suspicious Activities */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Security Warnings</h3>
        <div className="space-y-2">
          {suspiciousActivities.length === 0 ? (
            <div className="text-center py-6 bg-green-50 rounded-lg">
              <Shield className="h-10 w-10 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-green-700 font-medium">No suspicious activity detected</p>
            </div>
          ) : (
            suspiciousActivities.map((activity) => {
              const Icon = getEventIcon(activity.eventType);
              const severityColor = getSeverityColor(activity.severity);

              return (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border-2 ${severityColor}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{formatEventType(activity.eventType)}</p>
                        <span className="px-2 py-0.5 text-xs font-bold uppercase rounded">
                          {activity.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">
                        {activity.username && `User: ${activity.username} | `}
                        IP: {activity.ipAddress}
                      </p>
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="text-xs bg-white bg-opacity-50 p-2 rounded mt-2">
                          <strong>Details:</strong>{" "}
                          {JSON.stringify(activity.details, null, 2).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Multiple Accounts from Same IP */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Multi-Account Detection (Same IP)</h3>
        <div className="space-y-2">
          {multipleAccountsFromIP.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
              No suspicious IP activity detected
            </p>
          ) : (
            multipleAccountsFromIP.map((ipActivity, index) => (
              <div
                key={index}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">IP: {ipActivity.ipAddress}</p>
                    <p className="text-sm text-gray-600">
                      {ipActivity.userCount} different accounts | {ipActivity.loginCount} total logins
                    </p>
                  </div>
                  <Users className="h-6 w-6 text-red-600" />
                </div>
                <p className="text-xs text-red-700 mt-2">
                  ⚠️ Potential account abuse - Multiple users sharing same IP
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};