const { getSessionFromRequest, isValidSession } = require("../utils/auth");

function requireAuth(req, res, next) {
  const session = getSessionFromRequest(req);

  if (isValidSession(session)) {
    res.locals.isAuthenticated = true;
    return next();
  }

  return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl || "/")}`);
}

module.exports = {
  requireAuth
};
