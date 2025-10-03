const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  return res.status(statusCode).json(response);
};

const sendPaginatedResponse = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    count: data.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const sendValidationError = (res, errors) => {
  return sendError(res, 400, 'Validation failed', errors);
};

const sendAuthError = (res, message = 'Authentication failed') => {
  return sendError(res, 401, message);
};

const sendForbiddenError = (res, message = 'Access denied') => {
  return sendError(res, 403, message);
};

const sendNotFoundError = (res, resource = 'Resource') => {
  return sendError(res, 404, `${resource} not found`);
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  asyncHandler,
  sendValidationError,
  sendAuthError,
  sendForbiddenError,
  sendNotFoundError
};