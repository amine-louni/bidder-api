const AppError = require('../utils/AppError');

const checkForbiddenFields = async (req, res, next) => {
  if (req.body.role) {
    return next(
      new AppError("You don't have the permission to preform that action", 403)
    );
  }
  next();
};

module.exports = checkForbiddenFields;
