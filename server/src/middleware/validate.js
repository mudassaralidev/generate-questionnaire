const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return next(new ApiError(400, "Validation failed", messages));
  }
  next();
};

module.exports = validate;
