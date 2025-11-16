import { EventCount } from "../../types/analytics.types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface EventChartProps {
  eventCounts: EventCount[];
}

const EVENT_COLORS: Record<string, string> = {
  login: "#10b981",
  logout: "#6b7280",
  signup: "#3b82f6",
  view_product: "#8b5cf6",
  add_to_cart: "#f59e0b",
  purchase: "#059669",
  page_view: "#6366f1",
};

const formatEventType = (eventType: string): string => {
  return eventType
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const EventChart = ({ eventCounts }: EventChartProps) => {
  const data = eventCounts.map(event => ({
    name: formatEventType(event.eventType),
    count: event.count,
    eventType: event.eventType,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Event Distribution Today</h2>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          No event data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EVENT_COLORS[entry.eventType] || "#6b7280"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
