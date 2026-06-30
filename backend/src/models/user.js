const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Password Reset Fields ─────────────────────────────
    resetPasswordToken: {
      type: String,
      select: false, // never returned in queries by default
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// ── Hash password before saving ──────────────────────────
// Mongoose 9: async pre-hooks must NOT declare `next` as a parameter.
// The returned promise is awaited automatically by kareem.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ── Instance method: compare plain text vs hashed ───────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: generate and store reset token ─────
// Returns the RAW (unhashed) token — send this in the email.
// The HASHED version is stored in the DB. This way, even if
// the DB is compromised, the tokens cannot be used directly.
userSchema.methods.createPasswordResetToken = function () {
  // 32 bytes = 64 hex characters — cryptographically secure
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Store the SHA-256 hash in the DB
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Expires in 15 minutes
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken; // raw token to send in email
};

// ── Indexes ──────────────────────────────────────────────
// Note: email index is already created by `unique: true` in the field definition.
userSchema.index({ resetPasswordToken: 1 }); // fast lookup during password reset

module.exports = mongoose.model('User', userSchema);
