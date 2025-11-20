import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

/**
 * Sync Auth0 Logs Button
 *
 * This button allows admins to manually sync failed login attempts from Auth0
 * to the database. When Auth0 blocks a user, clicking this button will:
 * 1. Fetch failed login logs from Auth0
 * 2. Create records in failedlogins collection
 * 3. Set isBlocked = true for users with 3+ attempts
 *
 * Usage: Add to User Management page or Security Dashboard
 */
export const SyncAuth0Button = () => {
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

      toast.success("Auth0 Logs Synced!", {
        description: "Failed login attempts have been imported and users with 3+ attempts have been blocked.",
        duration: 5000,
      });

      // Refresh the page to show updated user statuses
      setTimeout(() => {
        window.location.reload();
      }, 1500);

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
      {syncing ? "Syncing from Auth0..." : "Sync Auth0 Logs"}
    </Button>
  );
};

export default SyncAuth0Button;
