/**
 * Expected application errors. Their messages are written for end users
 * and are safe to show. Anything else that is thrown is treated as an
 * unexpected error: logged on the server, shown as a generic message.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(
    readonly fieldErrors: Record<string, string[]>,
    message = "Check the highlighted fields.",
  ) {
    super(message, 422);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Your session has expired. Sign in again.") {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You don't have permission to do that.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "That item no longer exists.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many attempts. Try again in a few minutes.") {
    super(message, 429);
  }
}

export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

/** MongoDB duplicate key error (unique index violation). */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}
