export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    this.details = details;
  }
}

/**
 * 404 Route Not Found handler
 */
export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

/**
 * Robust Global Error Handler
 */
export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  let details = error.details || null;
  let errorCode = error.name || 'Error';

  // Handle Mongoose / MongoDB CastError (e.g. invalid ObjectId)
  if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier '${error.path}': ${error.value}`;
    errorCode = 'InvalidIdError';
  }

  // Handle Mongoose ValidationError
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'ValidationError';
    const fieldErrors = {};
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        fieldErrors[key] = error.errors[key].message;
      });
      details = fieldErrors;
      message = `Validation failed: ${Object.values(fieldErrors).join(', ')}`;
    }
  }

  // Handle MongoDB Duplicate Key error (11000)
  if (error.code === 11000) {
    statusCode = 409;
    errorCode = 'DuplicateKeyError';
    const fields = Object.keys(error.keyPattern || {});
    message = `Duplicate value entered for unique field: ${fields.join(', ')}`;
  }

  // Handle SyntaxError for bad JSON payload in request
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    errorCode = 'InvalidJsonPayload';
    message = 'Malformed JSON body in request';
  }

  // Log 500-level internal errors
  if (statusCode >= 500) {
    console.error(`[CRITICAL ERROR] ${req.method} ${req.originalUrl}:`, error);
  }

  const responsePayload = {
    success: false,
    message,
    errorCode,
    ...(details ? { details } : {})
  };

  res.status(statusCode).json(responsePayload);
}
