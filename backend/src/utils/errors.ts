export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[];

  constructor(statusCode: number, message: string, errors: unknown[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message: string, errors: unknown[] = []): ApiError {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }
  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }
  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }
  static validation(errors: unknown[]): ApiError {
    return new ApiError(422, 'Validation failed', errors);
  }
  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message);
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}