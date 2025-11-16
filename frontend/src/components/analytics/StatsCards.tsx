import { TodayStats } from "../../types/analytics.types";
import { Users, Activity, DollarSign, ShoppingCart } from "lucide-react";

interface StatsCardsProps {
  activeUsers: number;
  todayStats: TodayStats;
}

export const StatsCards = ({ activeUsers, todayStats }: StatsCardsProps) => {
  const stats = [
    {
      title: "Active Users Now",
      value: activeUsers,
      icon: Activity,
      color: "bg-green-100 text-green-600",
      description: "Last 30 minutes",
    },
    {
      title: "Today's Total Users",
      value: todayStats.totalUsers,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      description: "Unique users today",
    },
    {
      title: "Today's Revenue",
      value: `RM ${todayStats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
      description: "Total sales today",
    },
    {
      title: "Today's Orders",
      value: todayStats.totalOrders,
      icon: ShoppingCart,
      color: "bg-orange-100 text-orange-600",
      description: "Completed purchases",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
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
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </div>
        );
      })}
    </div>
  );
};
