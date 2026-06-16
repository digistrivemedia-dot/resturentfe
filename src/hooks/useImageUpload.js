import { useState, useCallback } from "react";
import api from "@/lib/api";

/**
 * Hook for uploading images to Cloudinary via the backend.
 *
 * @param {Object} options
 * @param {string} options.type - Upload type: "menu-item", "restaurant", "avatar", "banner", "general"
 * @param {Function} options.onSuccess - Callback with upload result { url, publicId, width, height }
 * @param {Function} options.onError - Callback with error message
 *
 * @returns {{ upload, uploadMultiple, remove, isUploading, progress, error }}
 */
export default function useImageUpload({ type = "general", onSuccess, onError } = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback(
    async (file) => {
      if (!file) return null;

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", type);

        const res = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        });

        const result = res.data;
        setIsUploading(false);
        setProgress(100);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const msg = err.message || "Upload failed";
        setError(msg);
        setIsUploading(false);
        setProgress(0);
        onError?.(msg);
        return null;
      }
    },
    [type, onSuccess, onError]
  );

  const uploadMultiple = useCallback(
    async (files) => {
      if (!files || files.length === 0) return [];

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append("images", file));
        formData.append("type", type);

        const res = await api.post("/upload/images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        });

        const result = res.data.images;
        setIsUploading(false);
        setProgress(100);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const msg = err.message || "Upload failed";
        setError(msg);
        setIsUploading(false);
        setProgress(0);
        onError?.(msg);
        return [];
      }
    },
    [type, onSuccess, onError]
  );

  const remove = useCallback(async (publicId) => {
    try {
      await api.delete("/upload/image", { data: { publicId } });
      return true;
    } catch (err) {
      setError(err.message || "Delete failed");
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
    setIsUploading(false);
  }, []);

  return { upload, uploadMultiple, remove, reset, isUploading, progress, error };
}
