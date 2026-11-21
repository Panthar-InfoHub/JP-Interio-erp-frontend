import { isAxiosError } from "axios";

/** The backend's error body: { success: false, error: { code, message, details?, requestId? } }. */
interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

/**
 * One error type for every failed API call.
 * Screens show `message` and branch on `code`, never on the text.
 * `status` 0 = no answer from the server (offline, timeout, CORS).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;

  constructor(params: {
    status: number;
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
    this.requestId = params.requestId;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;
  const error = (value as { error?: unknown }).error;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { code?: unknown }).code === "string" &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

/** Turns anything axios throws into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body: unknown = error.response?.data;

    if (isApiErrorBody(body)) {
      return new ApiError({ status, ...body.error });
    }
    if (status === 0) {
      return new ApiError({
        status,
        code: "NETWORK_ERROR",
        message: "Could not reach the server. Check your internet connection and try again.",
      });
    }
    return new ApiError({
      status,
      code: "UNKNOWN_ERROR",
      message: "Something went wrong. Please try again.",
    });
  }

  return new ApiError({
    status: 0,
    code: "UNKNOWN_ERROR",
    message: "Something went wrong. Please try again.",
  });
}
