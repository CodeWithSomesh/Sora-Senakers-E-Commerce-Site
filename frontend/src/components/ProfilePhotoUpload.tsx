import { useRef, useState } from "react";
import { useUploadProfilePhoto, useGetProfilePhoto, useDeleteProfilePhoto } from "@/api/PhotoApi";
import { Button } from "./ui/button";
import { Camera, Trash2, Upload, Lock, CheckCircle } from "lucide-react";

const ProfilePhotoUpload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");

  const { uploadPhoto, isLoading: isUploading } = useUploadProfilePhoto();
  const { photoUrl, isLoading: isLoadingPhoto, hasPhoto } = useGetProfilePhoto();
  const { deletePhoto, isLoading: isDeleting } = useDeleteProfilePhoto();

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File too large. Maximum size is 5MB.");
      return;
    }

    setUploadError("");
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadPhoto(selectedFile);
      setSelectedFile(null);
      setPreviewUrl("");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your profile photo?")) {
      try {
        await deletePhoto();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = previewUrl || photoUrl;
  const showActions = selectedFile || hasPhoto;

  return (
    <div className="space-y-4">
      {/* Photo Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {/* Photo Container */}
          <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-violet2 flex items-center justify-center">
            {isLoadingPhoto ? (
              <div className="animate-pulse flex items-center justify-center">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
            ) : displayUrl ? (
              <img
                src={displayUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-12 h-12 text-gray-400" />
            )}
          </div>

          {/* Encryption Badge */}
          {hasPhoto && !previewUrl && (
            <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-2 border-2 border-white" title="Encrypted">
              <Lock className="w-4 h-4" />
            </div>
          )}

          {/* Upload Success Badge */}
          {selectedFile && (
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 border-2 border-white" title="Ready to upload">
              <CheckCircle className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Security Info */}
        {hasPhoto && !previewUrl && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
            <Lock className="w-4 h-4" />
            <span className="font-medium">Encrypted with AES-256</span>
          </div>
        )}

        {/* Error Message */}
        {uploadError && (
          <div className="text-red-500 text-sm px-4 py-2 bg-red-50 rounded-md border border-red-200">
            {uploadError}
          </div>
        )}

        {/* File Info */}
        {selectedFile && (
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-md">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {!selectedFile && (
          <Button
            type="button"
            onClick={triggerFileInput}
            className="w-full bg-violet2 hover:bg-violet-700 text-white flex items-center justify-center gap-2"
            disabled={isUploading || isDeleting}
          >
            <Upload className="w-4 h-4" />
            {hasPhoto ? "Change Photo" : "Upload Photo"}
          </Button>
        )}

        {selectedFile && (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleUpload}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Encrypting & Uploading...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Encrypt & Upload
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl("");
                setUploadError("");
              }}
              variant="outline"
              className="px-6"
              disabled={isUploading}
            >
              Cancel
            </Button>
          </div>
        )}

        {hasPhoto && !selectedFile && (
          <Button
            type="button"
            onClick={handleDelete}
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
            disabled={isDeleting || isUploading}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete Photo"}
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 text-center px-4 py-3 bg-gray-50 rounded-md border border-gray-200">
        <p className="font-medium mb-1">🔒 Security Notice</p>
        <p>Your photo is encrypted with AES-256 encryption before being stored in the database. Only you can access and view your encrypted photo.</p>
      </div>

      {/* File Requirements */}
      <div className="text-xs text-gray-500 text-center">
        <p>Supported formats: JPEG, PNG, WebP</p>
        <p>Maximum file size: 5MB</p>
      </div>
    </div>
  );
};

export default ProfilePhotoUpload;
