export interface ApiErrorIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public code: string;
  public issues?: ApiErrorIssue[];

  constructor(statusCode: number, message: string, code = 'ERROR', issues?: ApiErrorIssue[]) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.code = code;
    this.issues = issues;
  }
}

export class ValidationError extends ApiError {
  constructor(message = 'bad request', issues?: ApiErrorIssue[]) {
    super(400, message, 'VALIDATION_ERROR', issues);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class TooManyRequestError extends ApiError {
  constructor(message = 'too many request') {
    super(429, message, 'TOO_MANY_REQUESTS');
  }
}

export class DatabaseError extends ApiError {
  constructor(message = 'database failed to do task') {
    super(502, message, 'DATABASE_ERROR');
  }
}
