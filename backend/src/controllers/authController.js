const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/user');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { signToken } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../services/emailService');

// ── Helper: sign token and send response ─────────────────
const sendTokenResponse = (res, user, statusCode) => {
  const token = signToken(user._id);

  // Omit password from response object (select: false handles queries,
  // but toObject() may still include it if the field was set during this request)
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  sendSuccess(res, { token, user: userObj }, statusCode);
};

// ── @desc  Register a new user
// ── @route POST /api/v1/auth/register
// ── @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic presence validation (Mongoose handles type/length validation)
  if (!name || !email || !password) {
    return sendError(res, 'Please provide name, email and password', 400);
  }

  // Prevent clients from self-assigning 'admin' role
  const safeRole = role === 'admin' ? 'user' : (role || 'user');

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return sendError(res, 'An account with this email already exists', 400);
  }

  const user = await User.create({ name, email, password, role: safeRole });

  sendTokenResponse(res, user, 201);
});

// ── @desc  Login
// ── @route POST /api/v1/auth/login
// ── @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 'Please provide email and password', 400);
  }

  // Re-select password (excluded by default with select: false)
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !user.isActive) {
    return sendError(res, 'Invalid credentials', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid credentials', 401);
  }

  sendTokenResponse(res, user, 200);
});

// ── @desc  Logout (client-side — server just acknowledges)
// ── @route POST /api/v1/auth/logout
// ── @access Private
const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, { message: 'Logged out successfully' });
});

// ── @desc  Get current logged-in user
// ── @route GET /api/v1/auth/me
// ── @access Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware
  sendSuccess(res, req.user);
});

// ── @desc  Request password reset — send email with link
// ── @route POST /api/v1/auth/forgot-password
// ── @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 'Please provide your email address', 400);
  }

  // Always respond with the same message to prevent user enumeration.
  // This means an attacker cannot determine which emails are registered.
  const SAFE_RESPONSE = 'If an account with that email exists, a password reset link has been sent.';

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // If no user — respond identically (do NOT reveal account existence)
  if (!user || !user.isActive) {
    return sendSuccess(res, { message: SAFE_RESPONSE });
  }

  // Generate raw token and store its hash on the user document
  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Build the reset URL that the frontend will handle
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
  const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

  try {
    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
      name: user.name,
    });

    sendSuccess(res, { message: SAFE_RESPONSE });
  } catch (err) {
    // If email send fails, clear the token so the user can try again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // Log full error for server-side diagnostics
    console.error('[ForgotPassword] Email send failed:', {
      message: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
    });

    return sendError(res, 'Email could not be sent. Please try again later.', 500);
  }
});

// ── @desc  Reset password using token from email link
// ── @route POST /api/v1/auth/reset-password/:token
// ── @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token) {
    return sendError(res, 'Reset token is missing', 400);
  }

  if (!password) {
    return sendError(res, 'Please provide a new password', 400);
  }

  if (password.length < 8) {
    return sendError(res, 'Password must be at least 8 characters', 400);
  }

  // Hash the raw token from the URL to compare against the stored hash
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find the user with a matching, non-expired token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }, // token must not be expired
  }).select('+resetPasswordToken +resetPasswordExpire +password');

  if (!user) {
    return sendError(res, 'Password reset token is invalid or has expired', 400);
  }

  // Set new password — the pre-save hook will hash it automatically
  user.password = password;

  // Clear reset token fields to prevent token reuse
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  // Log in immediately after reset — return a new JWT
  sendTokenResponse(res, user, 200);
});

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
