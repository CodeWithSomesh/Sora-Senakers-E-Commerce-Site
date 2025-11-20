/**
 * OPTIONAL: Add "Sync Auth0 Logs" Button to Admin Dashboard
 *
 * This file contains a React component that allows admins to manually
 * sync failed login logs from Auth0 to your database.
 *
 * INSTALLATION:
 * 1. Copy this component into: frontend/src/components/SyncAuth0Button.tsx
 * 2. Import it in your Security Dashboard or User Management page
 * 3. Add <SyncAuth0Button /> where you want the button to appear
 *
 * USAGE EXAMPLE:
 *
 * In AnalyticsDashboardPage.tsx:
 *
 * import SyncAuth0Button from "@/components/SyncAuth0Button";
 *
 * // Add in your component JSX:
 * <div className="mb-4">
 *   <SyncAuth0Button />
 * </div>
 */

import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

const SyncAuth0Button = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);

      const token = await getAccessTokenSilently();

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/security/sync-auth0-logs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to sync Auth0 logs");
      }

      const data = await response.json();

      toast.success("Auth0 Logs Synced", {
        description: data.message || "Successfully synced failed login attempts from Auth0",
        duration: 5000,
      });

      // Optionally refresh the dashboard data here
      // window.location.reload(); // or use your refresh logic

    } catch (error: any) {
      console.error("Sync failed:", error);
      toast.error("Sync Failed", {
        description: error.message || "Failed to sync Auth0 logs. Please try again.",
        duration: 5000,
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      variant="outline"
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Syncing..." : "Sync Auth0 Logs"}
    </Button>
  );
};

export default SyncAuth0Button;


/**
 * ALTERNATIVE: API Function Version
 *
 * If you prefer to keep logic in your API layer, add this to:
 * frontend/src/api/AdminUserApi.tsx (or create SecurityApi.tsx)
 */

/*
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:7000";

export const useSyncAuth0Logs = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const syncAuth0LogsRequest = async () => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${API_BASE_URL}/api/security/sync-auth0-logs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to sync Auth0 logs");
    }

    return response.json();
  };

  const {
    mutateAsync: syncLogs,
    isLoading,
    isSuccess,
  } = useMutation(syncAuth0LogsRequest, {
    onSuccess: () => {
      toast.success("Successfully synced failed login attempts from Auth0");
      // Invalidate security dashboard query to refresh data
      queryClient.invalidateQueries("securityDashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sync Auth0 logs");
    },
  });

  return {
    syncLogs,
    isLoading,
    isSuccess,
  };
};

// Then in your component:
import { useSyncAuth0Logs } from "@/api/AdminUserApi";

const MyComponent = () => {
  const { syncLogs, isLoading } = useSyncAuth0Logs();

  return (
    <Button onClick={() => syncLogs()} disabled={isLoading}>
      {isLoading ? "Syncing..." : "Sync Auth0 Logs"}
    </Button>
  );
};
*/


/**
 * EXAMPLE: Adding to Security Dashboard
 *
 * File: frontend/src/pages/AnalyticsDashboardPage.tsx
 */

/*
import SyncAuth0Button from "@/components/SyncAuth0Button";

// In your component JSX, add near the top of the dashboard:

<div className="mb-6 flex justify-between items-center">
  <h1 className="text-3xl font-bold">Security Dashboard</h1>
  <div className="flex gap-2">
    <SyncAuth0Button />
    <Button variant="outline">Refresh</Button>
  </div>
</div>
*/


/**
 * STYLING OPTIONS
 *
 * Option 1: Primary button with icon
 */

/*
<Button
  onClick={handleSync}
  disabled={syncing}
  className="bg-blue-600 hover:bg-blue-700 text-white"
>
  <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
  Sync Auth0 Logs
</Button>
*/

/**
 * Option 2: Icon-only button
 */

/*
<Button
  onClick={handleSync}
  disabled={syncing}
  variant="ghost"
  size="icon"
  title="Sync Auth0 Logs"
>
  <RefreshCw className={`h-5 w-5 ${syncing ? "animate-spin" : ""}`} />
</Button>
*/

/**
 * Option 3: With loading spinner and progress
 */

/*
import { Loader2 } from "lucide-react";

<Button onClick={handleSync} disabled={syncing}>
  {syncing ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Syncing from Auth0...
    </>
  ) : (
    <>
      <RefreshCw className="mr-2 h-4 w-4" />
      Sync Auth0 Logs
    </>
  )}
</Button>
*/


/**
 * AUTOMATIC SYNCING
 *
 * If you want to automatically sync logs when the dashboard loads:
 */

/*
import { useEffect } from "react";
import { useSyncAuth0Logs } from "@/api/AdminUserApi";

const AnalyticsDashboardPage = () => {
  const { syncLogs } = useSyncAuth0Logs();

  useEffect(() => {
    // Sync on component mount
    syncLogs();

    // Optionally set up interval for periodic syncing
    const interval = setInterval(() => {
      syncLogs();
    }, 30 * 60 * 1000); // Sync every 30 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    // ... your dashboard JSX
  );
};
*/


/**
 * SECURITY NOTES
 *
 * - This endpoint requires admin authentication
 * - Only authenticated admins with valid JWT can call it
 * - The sync only fetches logs from the last 24 hours
 * - Duplicate logs are automatically skipped
 * - Failed logins are flagged if 3+ attempts detected
 */
