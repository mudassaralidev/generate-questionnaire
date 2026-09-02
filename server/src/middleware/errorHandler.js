const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Mongoose validation failed', errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({
      success: false,
      message: `Duplicate key: ${field}`,
      errors: [`A configuration with these settings already exists.`],
    });
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error', errors: [] });
};

module.exports = errorHandler;
