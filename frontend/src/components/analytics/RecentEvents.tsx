import { AnalyticsEvent } from "../../types/analytics.types";
import {
  LogIn,
  LogOut,
  UserPlus,
  Eye,
  ShoppingCart,
  CreditCard,
  FileText
} from "lucide-react";

interface RecentEventsProps {
  events: AnalyticsEvent[];
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case "login":
      return LogIn;
    case "logout":
      return LogOut;
    case "signup":
      return UserPlus;
    case "view_product":
      return Eye;
    case "add_to_cart":
      return ShoppingCart;
    case "purchase":
      return CreditCard;
    case "page_view":
      return FileText;
    default:
      return FileText;
  }
};

const getEventColor = (eventType: string) => {
  switch (eventType) {
    case "login":
      return "bg-green-100 text-green-600";
    case "logout":
      return "bg-gray-100 text-gray-600";
    case "signup":
      return "bg-blue-100 text-blue-600";
    case "view_product":
      return "bg-purple-100 text-purple-600";
    case "add_to_cart":
      return "bg-yellow-100 text-yellow-600";
    case "purchase":
      return "bg-emerald-100 text-emerald-600";
    case "page_view":
      return "bg-indigo-100 text-indigo-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatEventDetails = (event: AnalyticsEvent): string => {
  switch (event.eventType) {
    case "login":
    case "logout":
    case "signup":
      return event.data?.username || "User";
    case "view_product":
      return event.data?.productName || "Product";
    case "add_to_cart":
      return `${event.data?.quantity || 1}x ${event.data?.productName || "item"}`;
    case "purchase":
      return `RM ${event.data?.totalAmount?.toFixed(2) || "0.00"}`;
    case "page_view":
      return event.data?.pagePath || "/";
    default:
      return "";
  }
};

const formatEventType = (eventType: string): string => {
  return eventType
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatTimestamp = (timestamp: Date): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

export const RecentEvents = ({ events }: RecentEventsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        ) : (
          events.map((event) => {
            const Icon = getEventIcon(event.eventType);
            const colorClass = getEventColor(event.eventType);
            const details = formatEventDetails(event);

            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {formatEventType(event.eventType)}
                  </p>
                  {details && (
                    <p className="text-xs text-gray-600 truncate">{details}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
