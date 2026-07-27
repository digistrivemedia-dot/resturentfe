import { useState, useCallback } from "react";
import api from "@/lib/api";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

/**
 * Hook for uploading images (and optionally videos) to the backend's disk-storage upload API.
 *
 * @param {Object} options
 * @param {string} options.type - Upload type: "menu-item", "restaurant", "avatar", "banner", "restaurant-video", "general"
 * @param {Function} options.onSuccess - Callback with upload result { url, filename, size, mimetype }
 * @param {Function} options.onError - Callback with error message
 *
 * @returns {{ upload, uploadMultiple, uploadVideo, remove, isUploading, progress, error }}
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

  const uploadVideo = useCallback(
    async (file) => {
      if (!file) return null;

      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        const msg = "Only MP4, WebM, or MOV videos are allowed";
        setError(msg);
        onError?.(msg);
        return null;
      }
      if (file.size > MAX_VIDEO_SIZE) {
        const msg = "Video must be under 50MB";
        setError(msg);
        onError?.(msg);
        return null;
      }

      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("video", file);
        formData.append("type", type);

        const res = await api.post("/upload/video", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 180000, // videos can take a while on slower connections
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
        const msg = err.response?.data?.message || err.message || "Video upload failed";
        setError(msg);
        setIsUploading(false);
        setProgress(0);
        onError?.(msg);
        return null;
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

  return { upload, uploadMultiple, uploadVideo, remove, reset, isUploading, progress, error };
}
