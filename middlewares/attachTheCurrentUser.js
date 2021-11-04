const attachTheCurrentUserToBody = async (req, res, next) => {
  req.body.user = req.currentUser._id;

  next();
};

module.exports = attachTheCurrentUserToBody;
