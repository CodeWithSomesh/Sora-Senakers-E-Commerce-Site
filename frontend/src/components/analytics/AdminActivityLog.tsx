import { AdminAction } from "../../types/security.types";
import { Shield, Clock, CheckCircle, AlertCircle, Edit, Trash2, Plus, Eye } from "lucide-react";
import { useState } from "react";
import { SecurityDetailsModal } from "./SecurityDetailsModal";

/**
 * ADMIN ACTIVITY LOG COMPONENT
 * Displays recent administrative actions with color coding
 */

interface AdminActivityLogProps {
  adminActions: AdminAction[];
  onItemClick?: (action: AdminAction) => void;
}

export const AdminActivityLog = ({ adminActions, onItemClick }: AdminActivityLogProps) => {
  const [selectedAction, setSelectedAction] = useState<AdminAction | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleClick = (action: AdminAction) => {
    setSelectedAction(action);
    setShowModal(true);
    if (onItemClick) {
      onItemClick(action);
    }
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes("add")) return Plus;
    if (actionType.includes("edit")) return Edit;
    if (actionType.includes("delete")) return Trash2;
    return Shield;
  };

  const getActionColor = (actionType: string) => {
    if (actionType.includes("add")) return "text-green-600 bg-green-100";
    if (actionType.includes("edit")) return "text-yellow-600 bg-yellow-100";
    if (actionType.includes("delete")) return "text-red-600 bg-red-100";
    return "text-blue-600 bg-blue-100";
  };

  const formatActionType = (actionType: string): string => {
    return actionType.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatTimestamp = (timestamp: Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-purple-600" />
        <h2 className="text-xl font-bold text-gray-900">Admin Activity Log</h2>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        <strong>Security Benefit:</strong> Provides accountability for privileged operations.
        Color-coded: <span className="text-green-600 font-semibold">Green (Add)</span>,{" "}
        <span className="text-yellow-600 font-semibold">Yellow (Edit)</span>,{" "}
        <span className="text-red-600 font-semibold">Red (Delete)</span>
      </p>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {adminActions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No admin actions today</p>
        ) : (
          adminActions.map((action) => {
            const Icon = getActionIcon(action.actionType);
            const colorClass = getActionColor(action.actionType);

            return (
              <div
                key={action.id}
                onClick={() => handleClick(action)}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer hover:shadow-md"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatActionType(action.actionType)}
                    </p>
                    {action.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{action.adminUsername}</span> modified{" "}
                    <span className="font-medium">{action.targetType}</span>
                    {action.targetName && `: ${action.targetName}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(action.timestamp)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick(action);
                  }}
                  className="ml-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <SecurityDetailsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        data={selectedAction}
        type="adminAction"
      />
    </div>
  );
};