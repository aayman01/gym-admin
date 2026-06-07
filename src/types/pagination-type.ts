export type PaginatedMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PaginatedList<T> = {
  data: T[];
  meta: PaginatedMeta;
};

export type PaginatedQuery = {
  page?: number;
  limit?: number;
  search?: string;
};
