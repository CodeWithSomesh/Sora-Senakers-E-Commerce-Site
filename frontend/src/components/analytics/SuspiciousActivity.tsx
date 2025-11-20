import { SuspiciousActivity as SuspiciousActivityType, IPActivity } from "../../types/security.types";
import { AlertTriangle, Users, DollarSign, Zap, Shield, Eye, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { SecurityDetailsModal } from "./SecurityDetailsModal";

/**
 * SUSPICIOUS ACTIVITY COMPONENT
 * Displays security warnings and suspicious patterns
 */

interface SuspiciousActivityProps {
  suspiciousActivities: SuspiciousActivityType[];
  multipleAccountsFromIP: IPActivity[];
  onActivityClick?: (activity: SuspiciousActivityType) => void;
  onIPClick?: (ipActivity: IPActivity) => void;
}

export const SuspiciousActivity = ({
  suspiciousActivities,
  multipleAccountsFromIP,
  onActivityClick,
  onIPClick
}: SuspiciousActivityProps) => {
  const [selectedActivity, setSelectedActivity] = useState<SuspiciousActivityType | null>(null);
  const [selectedIP, setSelectedIP] = useState<IPActivity | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showIPModal, setShowIPModal] = useState(false);

  const handleActivityClick = (activity: SuspiciousActivityType) => {
    setSelectedActivity(activity);
    setShowActivityModal(true);
    if (onActivityClick) {
      onActivityClick(activity);
    }
  };

  const handleIPClick = (ipActivity: IPActivity) => {
    setSelectedIP(ipActivity);
    setShowIPModal(true);
    if (onIPClick) {
      onIPClick(ipActivity);
    }
  };

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
    if (eventType.includes("admin_action")) return ShieldAlert;
    return AlertTriangle;
  };

  const formatEventType = (eventType: string, details?: any): string => {
    // Special formatting for admin actions
    if (eventType === "admin_action" && details?.actionType) {
      return `CRITICAL ADMIN ACTION: ${details.actionType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}`;
    }
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
                  onClick={() => handleActivityClick(activity)}
                  className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-lg transition-all ${severityColor}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{formatEventType(activity.eventType, activity.details)}</p>
                        <span className="px-2 py-0.5 text-xs font-bold uppercase rounded">
                          {activity.severity}
                        </span>
                      </div>
                      <p className="text-sm mb-2">
                        {activity.eventType === "admin_action" ? (
                          <>Admin: {activity.username} | Target: {activity.details?.targetName || activity.details?.targetType || "System"}</>
                        ) : (
                          <>{activity.username && `User: ${activity.username} | `}IP: {activity.ipAddress}</>
                        )}
                      </p>
                      {activity.details && Object.keys(activity.details).length > 0 && (
                        <div className="text-xs bg-white bg-opacity-50 p-2 rounded mt-2">
                          <strong>Details:</strong>{" "}
                          {JSON.stringify(activity.details, null, 2).slice(0, 100)}...
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityClick(activity);
                      }}
                      className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
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
                onClick={() => handleIPClick(ipActivity)}
                className="p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">IP: {ipActivity.ipAddress}</p>
                    <p className="text-sm text-gray-600">
                      {ipActivity.userCount} different accounts | {ipActivity.loginCount} total logins
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-red-600" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIPClick(ipActivity);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-red-700 mt-2">
                  ⚠️ Potential account abuse - Multiple users sharing same IP
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <SecurityDetailsModal
        open={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        data={selectedActivity}
        type="suspiciousActivity"
      />
      <SecurityDetailsModal
        open={showIPModal}
        onClose={() => setShowIPModal(false)}
        data={selectedIP}
        type="suspiciousIP"
      />
    </div>
  );
};