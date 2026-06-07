export type AdminMedia = {
  id: string;
  url: string;
  key: string;
  provider: string;
  format: string | null;
  width: number | null;
  height: number | null;
  resourceType: string;
  mimeType: string;
  size: number;
  uploadedByAdminId: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaUploadResponse = AdminMedia;
