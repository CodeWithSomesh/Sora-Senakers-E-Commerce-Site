import { useGetAllUsers, usePromoteToAdmin, useDemoteToUser, useDeactivateAccount, useActivateAccount, useBlockAccount, useUnblockAccount } from "@/api/AdminUserApi";
import { useGetMyUser } from "@/api/MyUserApi";
import AdminSidebar from "@/components/AdminSidebar";
import SyncAuth0Button from "@/components/SyncAuth0Button";
import { User } from "@/types";
import { ShieldCheck, ShieldOff, UserX, UserCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSidebar } from "@/context/SidebarContext";

const UserManagementPage = () => {
    const { users, isLoading, refetch } = useGetAllUsers();
    const { currentUser } = useGetMyUser();
    const { promoteToAdmin } = usePromoteToAdmin();
    const { demoteToUser } = useDemoteToUser();
    const { deactivateAccount } = useDeactivateAccount();
    const { activateAccount } = useActivateAccount();
    const { blockAccount } = useBlockAccount();
    const { unblockAccount } = useUnblockAccount();
    const { isCollapsed } = useSidebar();

    const [searchTerm, setSearchTerm] = useState("");
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        actionType: "promote" | "demote" | "deactivate" | "activate";
    }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => {},
        actionType: "promote",
    });

    const handlePromote = (userId: string, userName: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Promote to Admin",
            description: `Are you sure you want to promote ${userName || "this user"} to admin? They will have full administrative privileges.`,
            onConfirm: async () => {
                await promoteToAdmin(userId);
                refetch();
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
            actionType: "promote",
        });
    };

    const handleDemote = (userId: string, userName: string, targetUser: User) => {
        // Check if action is allowed
        if (userId === currentUser?._id) {
            toast.error("You cannot demote yourself");
            return;
        }
        if (targetUser.isSuperAdmin) {
            toast.error("Super admins cannot be demoted");
            return;
        }
        if (targetUser.isAdmin && !currentUser?.isSuperAdmin) {
            toast.error("Only super admins can demote other admins");
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: "Demote to User",
            description: `Are you sure you want to demote ${userName || "this admin"} to a regular user? They will lose all administrative privileges.`,
            onConfirm: async () => {
                await demoteToUser(userId);
                refetch();
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
            actionType: "demote",
        });
    };

    const handleDeactivate = (userId: string, userName: string, targetUser: User) => {
        // Check if action is allowed
        if (userId === currentUser?._id) {
            toast.error("You cannot deactivate your own account");
            return;
        }
        if (targetUser.isSuperAdmin) {
            toast.error("Super admins cannot be deactivated");
            return;
        }
        if (targetUser.isAdmin && !currentUser?.isSuperAdmin) {
            toast.error("Only super admins can deactivate other admins");
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: "Deactivate Account",
            description: `Are you sure you want to deactivate ${userName || "this user"}'s account? They will not be able to access the platform.`,
            onConfirm: async () => {
                await deactivateAccount(userId);
                refetch();
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
            actionType: "deactivate",
        });
    };

    const handleActivate = (userId: string, userName: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Activate Account",
            description: `Are you sure you want to activate ${userName || "this user"}'s account? They will regain access to the platform.`,
            onConfirm: async () => {
                await activateAccount(userId);
                refetch();
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
            actionType: "activate",
        });
    };

    const handleBlock = (userId: string, userName: string, targetUser: User) => {
        // Check if action is allowed
        if (userId === currentUser?._id) {
            toast.error("You cannot block your own account");
            return;
        }
        if (targetUser.isSuperAdmin) {
            toast.error("Super admins cannot be blocked");
            return;
        }
        if (targetUser.isAdmin && !currentUser?.isSuperAdmin) {
            toast.error("Only super admins can block other admins");
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: "Block Account",
            description: `Are you sure you want to block ${userName || "this user"}'s account? They will be blocked from accessing the platform.`,
            onConfirm: async () => {
                await blockAccount(userId);
                refetch();
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
            actionType: "deactivate",
        });
    };

    const handleUnblock = (userId: string, userName: string) => {
        setConfirmDialog({
            isOpen: true,
            title: "Unblock Account",
            description: `Are you sure you want to unblock ${userName || "this user"}'s account? They will be able to access the platform again.`,
            onConfirm: async () => {
                await unblockAccount(userId);
                refetch();
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
            actionType: "activate",
        });
    };

    const filteredUsers = users?.filter((user: User) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex">
                <AdminSidebar />
                <div className={`flex-1 ml-0 p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[350px]'}`}>
                    <div className="flex justify-center items-center h-screen">
                        <p className="text-2xl font-inter">Loading users...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex">
            <AdminSidebar />
            <div className={`flex-1 ml-0 p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[350px]'}`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold font-inter">User Management</h1>
                        <SyncAuth0Button />
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet2"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers && filteredUsers.length > 0 ? (
                                        filteredUsers.map((user: User) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">
                                                        {user.city && user.country
                                                            ? `${user.city}, ${user.country}`
                                                            : "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            user.isSuperAdmin
                                                                ? "bg-pink-100 text-pink-800"
                                                                : user.isAdmin
                                                                ? "bg-purple-100 text-purple-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}>
                                                            {user.isSuperAdmin ? "Super Admin" : user.isAdmin ? "Admin" : "User"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 text-center mx-auto font-semibold rounded-full ${
                                                            user.isBlocked
                                                                ? "bg-red-100 text-red-800"
                                                                : !user.isActive
                                                                ? "bg-yellow-100 text-yellow-800"
                                                                : "bg-green-100 text-green-800"
                                                        }`}>
                                                            {user.isBlocked ? "Blocked" : !user.isActive ? "Deactivated" : "Active"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex justify-center gap-2">
                                                        {/* Promote/Demote Button */}
                                                        {user.isAdmin ? (
                                                            <button
                                                                onClick={() => handleDemote(user._id, user.name, user)}
                                                                className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                                                                    user._id === currentUser?._id || user.isSuperAdmin || (user.isAdmin && !currentUser?.isSuperAdmin)
                                                                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                                                                        : "text-gray-700 bg-white hover:bg-gray-50"
                                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet2`}
                                                                title={
                                                                    user._id === currentUser?._id ? "Cannot demote yourself" :
                                                                    user.isSuperAdmin ? "Cannot demote super admin" :
                                                                    (user.isAdmin && !currentUser?.isSuperAdmin) ? "Only super admins can demote admins" :
                                                                    "Demote to User"
                                                                }
                                                            >
                                                                <ShieldOff className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handlePromote(user._id, user.name)}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-violet2 hover:bg-violet3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet2"
                                                                title="Promote to Admin"
                                                            >
                                                                <ShieldCheck className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        {/* Block/Unblock or Deactivate/Activate Button */}
                                                        {user.isBlocked ? (
                                                            <button
                                                                onClick={() => handleUnblock(user._id, user.name)}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                                                title="Unblock Account"
                                                            >
                                                                <UserCheck className="h-4 w-4" />
                                                            </button>
                                                        ) : !user.isActive ? (
                                                            <button
                                                                onClick={() => handleActivate(user._id, user.name)}
                                                                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                                title="Activate Account"
                                                            >
                                                                <UserCheck className="h-4 w-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleBlock(user._id, user.name, user)}
                                                                className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                                                                    user._id === currentUser?._id || user.isSuperAdmin || (user.isAdmin && !currentUser?.isSuperAdmin)
                                                                        ? "bg-red-300 cursor-not-allowed"
                                                                        : "bg-red-600 hover:bg-red-700"
                                                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                                                                title={
                                                                    user._id === currentUser?._id ? "Cannot block yourself" :
                                                                    user.isSuperAdmin ? "Cannot block super admin" :
                                                                    (user.isAdmin && !currentUser?.isSuperAdmin) ? "Only super admins can block admins" :
                                                                    "Block Account"
                                                                }
                                                            >
                                                                <UserX className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Total Users Count */}
                    {users && users.length > 0 && (
                        <div className="mt-4 text-sm text-gray-600">
                            Total Users: {users.length} | Showing: {filteredUsers?.length || 0}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, isOpen: open })}>
                <AlertDialogContent className="bg-white border-2 border-gray-200 shadow-2xl">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${
                                confirmDialog.actionType === "promote" ? "bg-purple-100" :
                                confirmDialog.actionType === "demote" ? "bg-red-100" :
                                confirmDialog.actionType === "deactivate" ? "bg-red-100" :
                                "bg-green-100"
                            }`}>
                                <AlertTriangle className={`h-6 w-6 ${
                                    confirmDialog.actionType === "promote" ? "text-violet2" :
                                    confirmDialog.actionType === "demote" ? "text-red-600" :
                                    confirmDialog.actionType === "deactivate" ? "text-red-600" :
                                    "text-green-600"
                                }`} />
                            </div>
                            <AlertDialogTitle className="text-2xl font-bold font-inter text-gray-900">
                                {confirmDialog.title}
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-base text-gray-600 font-inter leading-relaxed">
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6">
                        <AlertDialogCancel className="px-6 py-2 font-inter font-semibold border-2 border-gray-300 hover:bg-gray-100 transition-colors">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDialog.onConfirm}
                            className={`px-6 py-2 font-inter font-semibold text-white transition-colors ${
                                confirmDialog.actionType === "promote" ? "bg-violet2 hover:bg-violet3" :
                                confirmDialog.actionType === "demote" ? "bg-red-600 hover:bg-red-700" :
                                confirmDialog.actionType === "deactivate" ? "bg-red-600 hover:bg-red-700" :
                                "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            {confirmDialog.actionType === "promote" ? "Promote" :
                             confirmDialog.actionType === "demote" ? "Demote" :
                             confirmDialog.actionType === "deactivate" ? "Deactivate" :
                             "Activate"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UserManagementPage;
