/** The backend's success body (backend/src/utils/apiResponse.ts). */
export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

/** Pagination as sent in `meta` by list endpoints (backend/src/utils/pagination.ts). */
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
