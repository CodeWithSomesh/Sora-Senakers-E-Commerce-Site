import { User } from "@/types";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Get all users (admin only)
export const useGetAllUsers = () => {
    const { getAccessTokenSilently } = useAuth0();

    const getAllUsersRequest = async (): Promise<User[]> => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Failed to fetch users (Status: ${response.status})`;
            throw new Error(errorMessage);
        }

        return response.json();
    };

    const {
        data: users,
        isLoading,
        error,
        refetch,
    } = useQuery("fetchAllUsers", getAllUsersRequest);

    if (error) {
        toast.error(error.toString());
    }

    return { users, isLoading, refetch };
};

// Promote user to admin
export const usePromoteToAdmin = () => {
    const { getAccessTokenSilently } = useAuth0();

    const promoteToAdminRequest = async (userId: string) => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/promote`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to promote user to admin");
        }

        return response.json();
    };

    const {
        mutateAsync: promoteToAdmin,
        isLoading,
        error,
    } = useMutation(promoteToAdminRequest, {
        onSuccess: () => {
            toast.success("User promoted to admin successfully");
        },
        onError: (error: any) => {
            toast.error(error.toString());
        }
    });

    return { promoteToAdmin, isLoading };
};

// Demote admin to user
export const useDemoteToUser = () => {
    const { getAccessTokenSilently } = useAuth0();

    const demoteToUserRequest = async (userId: string) => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/demote`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to demote admin to user");
        }

        return response.json();
    };

    const {
        mutateAsync: demoteToUser,
        isLoading,
    } = useMutation(demoteToUserRequest, {
        onSuccess: () => {
            toast.success("Admin demoted to user successfully");
        },
        onError: (error: any) => {
            toast.error(error.toString());
        }
    });

    return { demoteToUser, isLoading };
};

// Deactivate user account
export const useDeactivateAccount = () => {
    const { getAccessTokenSilently } = useAuth0();

    const deactivateAccountRequest = async (userId: string) => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/deactivate`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to deactivate user account");
        }

        return response.json();
    };

    const {
        mutateAsync: deactivateAccount,
        isLoading,
    } = useMutation(deactivateAccountRequest, {
        onSuccess: () => {
            toast.success("User account deactivated successfully");
        },
        onError: (error: any) => {
            toast.error(error.toString());
        }
    });

    return { deactivateAccount, isLoading };
};

// Activate user account
export const useActivateAccount = () => {
    const { getAccessTokenSilently } = useAuth0();

    const activateAccountRequest = async (userId: string) => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/activate`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to activate user account");
        }

        return response.json();
    };

    const {
        mutateAsync: activateAccount,
        isLoading,
    } = useMutation(activateAccountRequest, {
        onSuccess: () => {
            toast.success("User account activated successfully");
        },
        onError: (error: any) => {
            toast.error(error.toString());
        }
    });

    return { activateAccount, isLoading };
};

// Block user account
export const useBlockAccount = () => {
    const { getAccessTokenSilently } = useAuth0();

    const blockAccountRequest = async (userId: string) => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/block`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to block user account");
        }

        return response.json();
    };

    const {
        mutateAsync: blockAccount,
        isLoading,
    } = useMutation(blockAccountRequest, {
        onSuccess: () => {
            toast.success("User account blocked successfully");
        },
        onError: (error: any) => {
            toast.error(error.toString());
        }
    });

    return { blockAccount, isLoading };
};

// Unblock user account
export const useUnblockAccount = () => {
    const { getAccessTokenSilently } = useAuth0();

    const unblockAccountRequest = async (userId: string) => {
        const accessToken = await getAccessTokenSilently();

        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/unblock`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to unblock user account");
        }

        return response.json();
    };

    const {
        mutateAsync: unblockAccount,
        isLoading,
    } = useMutation(unblockAccountRequest, {
        onSuccess: () => {
            toast.success("User account unblocked successfully");
        },
        onError: (error: any) => {
            toast.error(error.toString());
        }
    });

    return { unblockAccount, isLoading };
};
