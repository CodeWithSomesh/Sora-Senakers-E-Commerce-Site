import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Hook to upload encrypted profile photo
 */
export const useUploadProfilePhoto = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const uploadPhotoRequest = async (photoFile: File) => {
    const accessToken = await getAccessTokenSilently();

    const formData = new FormData();
    formData.append('profilePhoto', photoFile);

    const response = await fetch(`${API_BASE_URL}/api/my/user/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload photo");
    }

    return response.json();
  };

  const {
    mutateAsync: uploadPhoto,
    isLoading,
    isSuccess,
    error,
    reset,
  } = useMutation(uploadPhotoRequest, {
    onSuccess: () => {
      toast.success("Profile photo uploaded and encrypted successfully!");
      // Invalidate queries to refetch photo
      queryClient.invalidateQueries("profilePhoto");
      queryClient.invalidateQueries("photoMetadata");
    },
  });

  if (error) {
    toast.error(error.toString());
    reset();
  }

  return {
    uploadPhoto,
    isLoading,
    isSuccess,
  };
};

/**
 * Hook to get decrypted profile photo
 */
export const useGetProfilePhoto = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getPhotoRequest = async (): Promise<string> => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${API_BASE_URL}/api/my/user/photo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return ""; // No photo found
      }
      throw new Error("Failed to fetch photo");
    }

    // Convert image to base64 data URL
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const { data: photoUrl, isLoading, error } = useQuery(
    "profilePhoto",
    getPhotoRequest,
    {
      retry: 1,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  return {
    photoUrl,
    isLoading,
    hasPhoto: !!photoUrl,
  };
};

/**
 * Hook to delete profile photo
 */
export const useDeleteProfilePhoto = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  const deletePhotoRequest = async () => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${API_BASE_URL}/api/my/user/photo`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete photo");
    }

    return response.json();
  };

  const {
    mutateAsync: deletePhoto,
    isLoading,
    isSuccess,
    error,
    reset,
  } = useMutation(deletePhotoRequest, {
    onSuccess: () => {
      toast.success("Profile photo deleted successfully");
      // Invalidate queries to refetch
      queryClient.invalidateQueries("profilePhoto");
      queryClient.invalidateQueries("photoMetadata");
    },
  });

  if (error) {
    toast.error(error.toString());
    reset();
  }

  return {
    deletePhoto,
    isLoading,
    isSuccess,
  };
};

/**
 * Hook to get photo metadata
 */
export const useGetPhotoMetadata = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getMetadataRequest = async () => {
    const accessToken = await getAccessTokenSilently();

    const response = await fetch(`${API_BASE_URL}/api/my/user/photo/metadata`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch photo metadata");
    }

    return response.json();
  };

  const { data: metadata, isLoading } = useQuery(
    "photoMetadata",
    getMetadataRequest,
    {
      retry: 1,
    }
  );

  return {
    metadata,
    isLoading,
  };
};
