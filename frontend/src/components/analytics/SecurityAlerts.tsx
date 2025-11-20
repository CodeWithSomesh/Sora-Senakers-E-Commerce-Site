import { FailedLoginAttempt } from "../../types/security.types";
import { AlertCircle, Clock, User, MapPin, Eye } from "lucide-react";
import { useState } from "react";
import { SecurityDetailsModal } from "./SecurityDetailsModal";

/**
 * SECURITY ALERTS COMPONENT
 * Shows failed login attempts with flagging for multiple failures
 */

interface SecurityAlertsProps {
  failedLogins: FailedLoginAttempt[];
  onItemClick?: (login: FailedLoginAttempt) => void;
}

export const SecurityAlerts = ({ failedLogins, onItemClick }: SecurityAlertsProps) => {
  const [selectedLogin, setSelectedLogin] = useState<FailedLoginAttempt | null>(null);
  const [showModal, setShowModal] = useState(false);

  const formatTimestamp = (timestamp: Date): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleClick = (login: FailedLoginAttempt) => {
    setSelectedLogin(login);
    setShowModal(true);
    if (onItemClick) {
      onItemClick(login);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <h2 className="text-xl font-bold text-gray-900">Failed Login Attempts</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        <strong>Security Benefit:</strong> Detects brute-force attacks and credential stuffing attempts.
        Users with 3+ failures are automatically flagged for review.
      </p>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {failedLogins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>No failed login attempts - System secure!</p>
          </div>
        ) : (
          failedLogins.map((login) => (
            <div
              key={login.id}
              onClick={() => handleClick(login)}
              className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md ${
                login.flagged
                  ? "bg-red-50 border-red-500 hover:bg-red-100"
                  : "bg-gray-50 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">{login.username}</span>
                    {login.flagged && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                        ⚠️ FLAGGED ({login.attemptCount} attempts)
                      </span>
                    )}
                  </div>
                  {login.email && (
                    <p className="text-sm text-gray-600 mb-1">{login.email}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      IP: {login.ipAddress}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(login.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Reason: {login.reason.replace(/_/g, " ").toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(login);
                  }}
                  className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <SecurityDetailsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        data={selectedLogin}
        type="failedLogin"
      />
    </div>
  );
};