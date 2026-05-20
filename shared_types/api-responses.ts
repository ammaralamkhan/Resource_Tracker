// ─── Standardized API Response Wrappers ──────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Auth Response Types ─────────────────────────────────────

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface TokenRefreshResponse {
  token: string;
}
