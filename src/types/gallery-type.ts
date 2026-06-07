export type GalleryMedia = {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export type GalleryItem = {
  id: string;
  displayOrder: number;
  media: GalleryMedia;
};

export type GetGalleryQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export type SwapGalleryOrderPayload = {
  mediaId1: string;
  mediaId2: string;
};
