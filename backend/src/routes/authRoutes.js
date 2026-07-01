const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

// ── GET /api/v1/auth/me — return current Firebase user info ─
// Firebase handles login/register/forgot-password on the frontend.
// The backend only needs to confirm the identity of an already-authenticated user.
router.get('/me', protect, asyncHandler(async (req, res) => {
  sendSuccess(res, req.user);
}));

module.exports = router;
