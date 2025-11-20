import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, Shield, AlertTriangle, Activity, User } from "lucide-react";

interface FailedLoginDetails {
  id: string;
  username: string;
  email: string;
  ipAddress: string;
  timestamp: Date;
  attemptCount: number;
  flagged: boolean;
  reason: string;
  userAgent?: string;
}

interface AdminActionDetails {
  id: string;
  adminUsername: string;
  actionType: string;
  targetType: string;
  targetName: string;
  timestamp: Date;
  status: string;
  changes?: Record<string, any>;
  ipAddress?: string;
}

interface SuspiciousActivityDetails {
  id: string;
  eventType: string;
  username: string;
  ipAddress: string;
  severity: string;
  details: Record<string, any>;
  timestamp: Date;
}

interface SuspiciousIPDetails {
  ipAddress: string;
  userCount: number;
  loginCount: number;
  users?: string[];
}

type DetailType = FailedLoginDetails | AdminActionDetails | SuspiciousActivityDetails | SuspiciousIPDetails;

interface SecurityDetailsModalProps {
  open: boolean;
  onClose: () => void;
  data: DetailType | null;
  type: "failedLogin" | "adminAction" | "suspiciousActivity" | "suspiciousIP";
}

export const SecurityDetailsModal = ({
  open,
  onClose,
  data,
  type,
}: SecurityDetailsModalProps) => {
  if (!data) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderFailedLoginDetails = (details: FailedLoginDetails) => (
    <>
      <AlertDialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${details.flagged ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <Shield className={`h-6 w-6 ${details.flagged ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
            <div>
              <AlertDialogTitle className="text-2xl font-bold text-gray-900">
                Failed Login Attempt Details
              </AlertDialogTitle>
              {details.flagged && (
                <span className="inline-block mt-1 px-2 py-1 text-xs font-bold text-red-800 bg-red-200 rounded">
                  🚨 FLAGGED - POTENTIAL BRUTE FORCE ATTACK
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </AlertDialogHeader>

      <AlertDialogDescription asChild>
        <div className="space-y-4 mt-4">
          {/* Threat Level */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Threat Assessment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Severity Level</p>
                <p className={`text-lg font-bold ${details.flagged ? 'text-red-600' : 'text-yellow-600'}`}>
                  {details.flagged ? 'HIGH RISK' : 'MEDIUM RISK'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Attempt Count</p>
                <p className="text-lg font-bold text-gray-900">{details.attemptCount} attempts</p>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="font-semibold text-gray-900">{details.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold text-gray-900">{details.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failure Reason:</span>
                <span className="font-semibold text-red-600">{details.reason}</span>
              </div>
            </div>
          </div>

          {/* Network Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">IP Address:</span>
                <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {details.ipAddress}
                </span>
              </div>
              {details.userAgent && (
                <div className="flex flex-col gap-1">
                  <span className="text-gray-600">User Agent:</span>
                  <span className="text-xs text-gray-700 bg-gray-100 p-2 rounded break-all">
                    {details.userAgent}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Timestamp:</span>
                <span className="font-semibold text-gray-900">{formatDate(details.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          {details.flagged && (
            <div className="border-t pt-4 bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Recommended Security Actions</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                <li>Account has been automatically blocked</li>
                <li>Monitor IP address {details.ipAddress} for further attacks</li>
                <li>Consider implementing IP-based rate limiting</li>
                <li>Alert user via email about suspicious activity</li>
                <li>Review firewall rules for this IP range</li>
              </ul>
            </div>
          )}
        </div>
      </AlertDialogDescription>
    </>
  );

  const renderAdminActionDetails = (details: AdminActionDetails) => {
    const getActionColor = (action: string) => {
      if (action.includes('delete')) return 'text-red-600';
      if (action.includes('edit') || action.includes('update')) return 'text-yellow-600';
      if (action.includes('add') || action.includes('create')) return 'text-green-600';
      return 'text-blue-600';
    };

    return (
      <>
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <AlertDialogTitle className="text-2xl font-bold text-gray-900">
                  Admin Action Audit Log
                </AlertDialogTitle>
                <span className="text-sm text-gray-600">Privileged Operation Details</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="space-y-4 mt-4">
            {/* Action Summary */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Action Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Action Type</p>
                  <p className={`text-lg font-bold uppercase ${getActionColor(details.actionType)}`}>
                    {details.actionType.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-bold text-green-600 uppercase">{details.status}</p>
                </div>
              </div>
            </div>

            {/* Administrator Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Administrator Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin Email:</span>
                  <span className="font-semibold text-gray-900">{details.adminUsername}</span>
                </div>
                {details.ipAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {details.ipAddress}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Timestamp:</span>
                  <span className="font-semibold text-gray-900">{formatDate(details.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Target Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Target Resource</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Resource Type:</span>
                  <span className="font-semibold text-gray-900 capitalize">{details.targetType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resource Name:</span>
                  <span className="font-semibold text-gray-900">{details.targetName}</span>
                </div>
              </div>
            </div>

            {/* Changes Made */}
            {details.changes && Object.keys(details.changes).length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Changes Made</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-sm text-gray-800 overflow-x-auto">
                    {JSON.stringify(details.changes, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Audit Trail Note */}
            <div className="border-t pt-4 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Audit Trail</h3>
              <p className="text-sm text-blue-800">
                This action has been logged for compliance and security audit purposes. All administrative
                operations are tracked with timestamp, IP address, and change details to ensure accountability
                and enable incident investigation.
              </p>
            </div>
          </div>
        </AlertDialogDescription>
      </>
    );
  };

  const renderSuspiciousActivityDetails = (details: SuspiciousActivityDetails) => {
    const getSeverityColor = (severity: string) => {
      if (severity === 'critical') return { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' };
      if (severity === 'high') return { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300' };
      if (severity === 'medium') return { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' };
      return { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' };
    };

    const colors = getSeverityColor(details.severity);

    return (
      <>
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${colors.bg}`}>
                <AlertTriangle className={`h-6 w-6 ${colors.text}`} />
              </div>
              <div>
                <AlertDialogTitle className="text-2xl font-bold text-gray-900">
                  Suspicious Activity Alert
                </AlertDialogTitle>
                <span className={`inline-block mt-1 px-2 py-1 text-xs font-bold ${colors.text} ${colors.bg} rounded uppercase`}>
                  {details.severity} Severity
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription asChild>
          <div className="space-y-4 mt-4">
            {/* Threat Information */}
            <div className={`p-4 rounded-lg border-2 ${colors.border} ${colors.bg}`}>
              <h3 className="font-semibold text-gray-900 mb-2">Threat Type</h3>
              <p className="text-lg font-bold text-gray-900 uppercase">
                {details.eventType.replace('_', ' ')}
              </p>
            </div>

            {/* User Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Suspicious User
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Username/Email:</span>
                  <span className="font-semibold text-gray-900">{details.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IP Address:</span>
                  <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {details.ipAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Detection Time:</span>
                  <span className="font-semibold text-gray-900">{formatDate(details.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Activity Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Activity Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {Object.entries(details.details).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="font-semibold text-gray-900">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div className={`border-t pt-4 p-4 rounded-lg ${colors.bg}`}>
              <h3 className={`font-semibold mb-2 ${colors.text}`}>⚠️ Recommended Actions</h3>
              <ul className={`list-disc list-inside space-y-1 text-sm ${colors.text}`}>
                <li>Review user account history and previous transactions</li>
                <li>Monitor IP address {details.ipAddress} for similar patterns</li>
                <li>Consider temporary account restrictions</li>
                <li>Cross-reference with other fraud detection systems</li>
                {details.severity === 'critical' && (
                  <>
                    <li className="font-bold">⚡ Immediate action required - potential fraud in progress</li>
                    <li className="font-bold">Consider blocking account pending investigation</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </AlertDialogDescription>
      </>
    );
  };

  const renderSuspiciousIPDetails = (details: SuspiciousIPDetails) => (
    <>
      <AlertDialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-orange-100">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-2xl font-bold text-gray-900">
                Suspicious IP Activity
              </AlertDialogTitle>
              <span className="text-sm text-gray-600">Multiple Account Detection</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </AlertDialogHeader>

      <AlertDialogDescription asChild>
        <div className="space-y-4 mt-4">
          {/* IP Information */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">IP Address Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="text-xl font-mono font-bold text-gray-900 bg-white px-3 py-2 rounded mt-1">
                  {details.ipAddress}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Unique Users</p>
                  <p className="text-2xl font-bold text-orange-600">{details.userCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Logins</p>
                  <p className="text-2xl font-bold text-orange-600">{details.loginCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Threat Assessment */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Threat Assessment</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-800 mb-2">
                <strong>Risk Level:</strong> <span className="text-orange-600 font-bold">MEDIUM to HIGH</span>
              </p>
              <p className="text-sm text-gray-700">
                This IP address has been associated with <strong>{details.userCount}</strong> different user accounts,
                which may indicate:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-700">
                <li>Shared network (office, school, cafe) - Low Risk</li>
                <li>Account farming or bot activity - High Risk</li>
                <li>VPN/Proxy usage - Medium Risk</li>
                <li>Credential stuffing attack - Critical Risk</li>
              </ul>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="border-t pt-4 bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">⚠️ Recommended Actions</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-orange-800">
              <li>Investigate IP geolocation and ISP details</li>
              <li>Review account creation dates and patterns</li>
              <li>Implement CAPTCHA for this IP range</li>
              <li>Monitor for unusual purchase patterns</li>
              <li>Consider temporary rate limiting for this IP</li>
              {details.userCount >= 5 && (
                <li className="font-bold">⚡ High risk: Consider blocking IP pending investigation</li>
              )}
            </ul>
          </div>
        </div>
      </AlertDialogDescription>
    </>
  );

  const renderContent = () => {
    switch (type) {
      case "failedLogin":
        return renderFailedLoginDetails(data as FailedLoginDetails);
      case "adminAction":
        return renderAdminActionDetails(data as AdminActionDetails);
      case "suspiciousActivity":
        return renderSuspiciousActivityDetails(data as SuspiciousActivityDetails);
      case "suspiciousIP":
        return renderSuspiciousIPDetails(data as SuspiciousIPDetails);
      default:
        return null;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        {renderContent()}
      </AlertDialogContent>
    </AlertDialog>
  );
};
