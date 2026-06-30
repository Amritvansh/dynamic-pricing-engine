const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/user');
const { sendError } = require('../utils/apiResponse');

// ── Generate signed JWT ──────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── protect — verify JWT and attach req.user ─────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Accept token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorised — no token provided', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired — please log in again'
        : 'Invalid token — please log in again';
    return sendError(res, message, 401);
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user || !user.isActive) {
    return sendError(res, 'User no longer exists or is deactivated', 401);
  }

  req.user = user;
  next();
});

// ── authorize — restrict to specific roles ───────────────
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendError(
      res,
      `Role '${req.user.role}' is not authorised to access this resource`,
      403
    );
  }
  next();
};

module.exports = { protect, authorize, signToken };
