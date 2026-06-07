export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  error: undefined;
  timestamp: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  data: undefined;
  error: unknown;
  timestamp: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/** Alias matching ezybuzz-front envelope naming. */
export type SingleApiResponse<T> = ApiSuccessResponse<T>;
