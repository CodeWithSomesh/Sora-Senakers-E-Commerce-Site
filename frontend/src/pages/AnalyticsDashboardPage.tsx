import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AdminSidebar from "../components/AdminSidebar";
import { StatsCards } from "../components/analytics/StatsCards";
import { RecentEvents } from "../components/analytics/RecentEvents";
import { TopProducts } from "../components/analytics/TopProducts";
import { EventChart } from "../components/analytics/EventChart";
import { SecurityMetricsCards } from "../components/analytics/SecurityMetricsCards";
import { SecurityAlerts } from "../components/analytics/SecurityAlerts";
import { AdminActivityLog } from "../components/analytics/AdminActivityLog";
import { SuspiciousActivity } from "../components/analytics/SuspiciousActivity";
import { getDashboardData } from "../services/analytics.service";
import { getSecurityDashboard } from "../services/security.service";
import { DashboardData } from "../types/analytics.types";
import { SecurityDashboardData } from "../types/security.types";
import { RefreshCw, BarChart3, Shield } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

export default function AnalyticsDashboardPage() {
  const { getAccessTokenSilently } = useAuth0();
  const { isCollapsed } = useSidebar();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [securityData, setSecurityData] = useState<SecurityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"overview" | "security">("security");
  const [showDummyButton, setShowDummyButton] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAccessTokenSilently();

      // Fetch both analytics and security data in parallel
      const [analyticsData, secData] = await Promise.all([
        getDashboardData(token),
        getSecurityDashboard(token)
      ]);

      setDashboardData(analyticsData);
      setSecurityData(secData);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  /**
   * DEMO MODE: Load dummy data for demonstration purposes
   * This populates the security dashboard with realistic sample data
   */
  const loadDummyData = () => {
    const now = new Date();

    // Create dummy security data
    const dummySecurityData: SecurityDashboardData = {
      metrics: {
        failedLoginCount: 8,
        flaggedLogins: 2,
        flaggedTransactions: 3,
        adminActionCount: 7,
        suspiciousActivityCount: 2,
        blockedIPs: 1
      },
      failedLogins: [
        {
          id: "1",
          username: "hacker123",
          email: "hacker@test.com",
          ipAddress: "192.168.1.100",
          timestamp: new Date(now.getTime() - 5 * 60000),
          attemptCount: 5,
          flagged: true,
          reason: "Invalid credentials"
        },
        {
          id: "2",
          username: "testuser",
          email: "test@example.com",
          ipAddress: "192.168.1.50",
          timestamp: new Date(now.getTime() - 15 * 60000),
          attemptCount: 3,
          flagged: true,
          reason: "Email not verified"
        },
        {
          id: "3",
          username: "john.doe",
          email: "john@example.com",
          ipAddress: "192.168.1.75",
          timestamp: new Date(now.getTime() - 30 * 60000),
          attemptCount: 2,
          flagged: false,
          reason: "User denied authorization"
        }
      ],
      adminActions: [
        {
          id: "1",
          adminUsername: "admin@sorasneakers.com",
          actionType: "product_delete",
          targetType: "product",
          targetName: "Old Stock Clearance",
          timestamp: new Date(now.getTime() - 5 * 60000),
          status: "success"
        },
        {
          id: "2",
          adminUsername: "admin@sorasneakers.com",
          actionType: "product_edit",
          targetType: "product",
          targetName: "Adidas UltraBoost",
          timestamp: new Date(now.getTime() - 15 * 60000),
          status: "success"
        },
        {
          id: "3",
          adminUsername: "manager@sorasneakers.com",
          actionType: "product_add",
          targetType: "product",
          targetName: "Nike Air Max 2024",
          timestamp: new Date(now.getTime() - 30 * 60000),
          status: "success"
        },
        {
          id: "4",
          adminUsername: "admin@sorasneakers.com",
          actionType: "product_edit",
          targetType: "product",
          targetName: "Puma Running Shoes",
          timestamp: new Date(now.getTime() - 45 * 60000),
          status: "success"
        },
        {
          id: "5",
          adminUsername: "manager@sorasneakers.com",
          actionType: "product_delete",
          targetType: "product",
          targetName: "Discontinued Model X",
          timestamp: new Date(now.getTime() - 60 * 60000),
          status: "success"
        }
      ],
      suspiciousActivities: [
        {
          id: "1",
          eventType: "high_value_purchase",
          username: "newuser@test.com",
          ipAddress: "203.45.67.89",
          severity: "critical",
          details: { purchaseAmount: 850, accountAge: 2 },
          timestamp: new Date(now.getTime() - 20 * 60000)
        },
        {
          id: "2",
          eventType: "rapid_checkout",
          username: "suspicious@example.com",
          ipAddress: "198.51.100.42",
          severity: "medium",
          details: { checkoutInterval: 15 },
          timestamp: new Date(now.getTime() - 40 * 60000)
        }
      ],
      multipleAccountsFromIP: [
        {
          ipAddress: "192.168.1.200",
          userCount: 4,
          loginCount: 8
        }
      ],
      securityEventCounts: [
        { eventType: "failed_login", count: 8 },
        { eventType: "successful_login", count: 6 },
        { eventType: "suspicious_activity", count: 2 }
      ],
      loginComparison: {
        successful: 6,
        failed: 8
      }
    };

    setSecurityData(dummySecurityData);
    setLoading(false);
    setShowDummyButton(false);
    setLastRefresh(new Date());
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className={`flex-1 ml-0 p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[350px]'}`}>
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className={activeTab === "security" ? "bg-red-100 p-2 md:p-3 rounded-lg" : "bg-purple-100 p-2 md:p-3 rounded-lg"}>
                  {activeTab === "security" ? (
                    <Shield className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                  ) : (
                    <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    {activeTab === "security" ? "Security Analytics" : "Analytics Dashboard"}
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 mt-1">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              {/* Tab Buttons */}
              <div className="flex bg-white rounded-lg shadow-sm border p-1 w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("security")}
                  className={`px-3 md:px-4 py-2 rounded-md font-semibold transition-colors text-sm md:text-base flex-1 sm:flex-none ${
                    activeTab === "security"
                      ? "bg-red-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Shield className="h-4 w-4 inline mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Security</span>
                  <span className="sm:hidden">Sec</span>
                </button>
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-3 md:px-4 py-2 rounded-md font-semibold transition-colors text-sm md:text-base flex-1 sm:flex-none ${
                    activeTab === "overview"
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Over</span>
                </button>
              </div>

              {/* Dummy Data Button - Only shows before data is loaded */}
              {showDummyButton && (
                <button
                  onClick={loadDummyData}
                  className=" hidden flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-semibold text-sm md:text-base"
                >
                  <span className="hidden sm:inline">Use Dummy Data</span>
                  <span className="sm:hidden">Dummy Data</span>
                </button>
              )}

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && !dashboardData && !securityData && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && securityData && (
          <div className="space-y-6">
            {/* Security Metrics Cards */}
            <SecurityMetricsCards metrics={securityData.metrics} />

            {/* Security Alerts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SecurityAlerts failedLogins={securityData.failedLogins} />
              <AdminActivityLog adminActions={securityData.adminActions} />
            </div>

            {/* Suspicious Activity */}
            <SuspiciousActivity
              suspiciousActivities={securityData.suspiciousActivities}
              multipleAccountsFromIP={securityData.multipleAccountsFromIP}
            />

            {/* Login Success vs Failed Comparison */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Login Attempts Analysis (Today)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Security Benefit:</strong> Comparing successful vs failed logins helps identify
                potential security threats and authentication issues.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-semibold mb-2">Successful Logins</p>
                  <p className="text-4xl font-bold text-green-900">
                    {securityData.loginComparison.successful}
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-semibold mb-2">Failed Logins</p>
                  <p className="text-4xl font-bold text-red-900">
                    {securityData.loginComparison.failed}
                  </p>
                </div>
              </div>
              {securityData.loginComparison.failed > securityData.loginComparison.successful && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">
                    ⚠️ Warning: Failed logins exceed successful logins - potential security threat!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && dashboardData && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <StatsCards
              activeUsers={dashboardData.activeUsers}
              todayStats={dashboardData.todayStats}
            />

            {/* Event Chart */}
            <EventChart eventCounts={dashboardData.eventCounts} />

            {/* Recent Events and Top Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentEvents events={dashboardData.recentEvents} />
              <TopProducts products={dashboardData.topProducts} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
