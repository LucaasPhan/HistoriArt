/**
 * Error constants for consistent error handling across the application
 */

// Error codes for routing and user feedback
export const ERROR_CODES = {
  // Auth & Authorization
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_LOGGED_IN: "not-logged-in",

  // Resource & Validation
  NOT_FOUND: "not-found",
  BAD_REQUEST: "bad-request",
  MISSING_REQUIRED_FIELDS: "missing-required-fields",
  INVALID_INPUT: "invalid-input",
  DUPLICATE_RESOURCE: "duplicate-resource",

  // File Upload
  FILE_UPLOAD_FAILED: "file-upload-failed",
  INVALID_FILE_TYPE: "invalid-file-type",
  FILE_SIZE_TOO_LARGE: "file-size-too-large",

  // Server & Infrastructure
  INTERNAL_SERVER_ERROR: "internal-server-error",
  DATABASE_ERROR: "database-error",
  CACHE_ERROR: "cache-error",
  NETWORK_ERROR: "network-error",
  UNKNOWN_ERROR: "unknown-error",
} as const;

// User-friendly error messages (i18n keys)
export const ERROR_MESSAGES = {
  // Auth & Authorization
  [ERROR_CODES.UNAUTHORIZED]: "error:unauthorized",
  [ERROR_CODES.FORBIDDEN]: "error:forbidden",
  [ERROR_CODES.NOT_LOGGED_IN]: "error:not-logged-in",

  // Resource & Validation
  [ERROR_CODES.NOT_FOUND]: "error:not-found",
  [ERROR_CODES.BAD_REQUEST]: "error:bad-request",
  [ERROR_CODES.MISSING_REQUIRED_FIELDS]: "error:missing-required-fields",
  [ERROR_CODES.INVALID_INPUT]: "error:invalid-input",
  [ERROR_CODES.DUPLICATE_RESOURCE]: "error:duplicate-resource",

  // File Upload
  [ERROR_CODES.FILE_UPLOAD_FAILED]: "error:file-upload-failed",
  [ERROR_CODES.INVALID_FILE_TYPE]: "error:invalid-file-type",
  [ERROR_CODES.FILE_SIZE_TOO_LARGE]: "error:file-size-too-large",

  // Server & Infrastructure
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: "error:internal-server-error",
  [ERROR_CODES.DATABASE_ERROR]: "error:database-error",
  [ERROR_CODES.CACHE_ERROR]: "error:cache-error",
  [ERROR_CODES.NETWORK_ERROR]: "error:network-error",
  [ERROR_CODES.UNKNOWN_ERROR]: "error:unknown-error",
} as const;

// HTTP status codes for API responses
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error response structure for API endpoints
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: string;
}

// Success response structure for server actions
export interface ActionSuccessResponse<T = unknown> {
  success: true;
  data?: T;
}

// Error response structure for server actions
export interface ActionErrorResponse {
  success: false;
  message: string;
  code?: string;
}

// Union type for server action responses
export type ActionResponse<T = unknown> = ActionSuccessResponse<T> | ActionErrorResponse;

/**
 * Helper function to create consistent API error responses
 */
export function createApiError(
  code: keyof typeof ERROR_CODES,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  details?: string,
): Response {
  const errorCode = ERROR_CODES[code];
  const message = ERROR_MESSAGES[errorCode];

  const response: ApiErrorResponse = {
    error: message,
    code: errorCode,
    ...(details && { details }),
  };

  return new Response(JSON.stringify(response), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Helper function to create consistent server action error responses
 */
export function createActionError(
  code: keyof typeof ERROR_CODES,
  customMessage?: string,
): ActionErrorResponse {
  const errorCode = ERROR_CODES[code];
  const message = customMessage || ERROR_MESSAGES[errorCode];

  return {
    success: false,
    message,
    code: errorCode,
  };
}

/**
 * Helper function to create consistent server action success responses
 */
export function createActionSuccess<T = unknown>(data?: T): ActionSuccessResponse<T> {
  return {
    success: true,
    ...(data && { data }),
  };
}

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(errorCode: string): string {
  return (
    ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] ||
    ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR]
  );
}

// Type exports
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
