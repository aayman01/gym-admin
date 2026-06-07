import { useMutation } from '@tanstack/react-query';
import type { ApiResponse } from '@/types/api.types';
import type { MediaUploadResponse } from '@/types/media-type';
import { apiClient, ApiError } from '@/lib/api-client';

const BASE_URL = '/admin/media/upload';

export function validateImageFile(file: File, maxSizeMB = 8): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Only image files are allowed';
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `File must be smaller than ${maxSizeMB}MB`;
  }
  return null;
}

export async function uploadMedia(file: File) {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new ApiError(validationError);
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<MediaUploadResponse>>(
    BASE_URL,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  const payload = response.data;
  if (!payload.success) {
    throw new ApiError(payload.message, response.status);
  }

  return payload.data;
}

export function useUploadMedia() {
  return useMutation({
    mutationFn: uploadMedia,
  });
}
