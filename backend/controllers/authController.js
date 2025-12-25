const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserPreferences = require('../models/UserPreferences');
const PasswordResetToken = require('../models/PasswordResetToken');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../utils/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

const CODE_EXPIRY_MINUTES = 15;
const CODE_EXPIRY_MS = CODE_EXPIRY_MINUTES * 60 * 1000;

const sendVerificationEmail = async (email, code) => {
  await sendMail({
    to: email,
    subject: 'Verify your CoreIQ account',
    text: `Your CoreIQ verification code is ${code}. It will expire in 15 minutes.`,
    html: `
      <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, 'sans-serif'; background: #f6f9fe; margin:0; padding:40px 0; min-height:100vh;">
        <div style="max-width:440px;margin:40px auto; background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(27, 51, 115, .05); padding:40px 36px; text-align:center;">
          <h2 style="color:#2563eb; margin-bottom:12px; font-size: 2em; font-weight:700; letter-spacing: .5px;">Welcome to CoreIQ</h2>
          <div style="color:#475467; font-size: 1.05em; margin-bottom: 24px; border-bottom:1.5px solid #f1f1f1; padding-bottom:12px;">To finish creating your account, enter this code in your app:</div>
          <div style="display:inline-block; background:#e4edfe; border-radius:10px; padding:18px 0; width:220px; font-size:2.4em; font-weight:600; letter-spacing:12px; color:#2563eb; margin-bottom:10px; margin-top:6px;">
            ${code}
          </div>
          <div style="color:#667085; font-size:1em; margin:30px 0 6px 0;">This code expires in 15 minutes.<br>If you didn’t try to sign up, you can safely ignore this.</div>
          <div style="margin:36px 0 0 0; color:#b2b2b2; font-size:.93em;">— CoreIQ Team</div>
        </div>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, code) => {
  await sendMail({
    to: email,
    subject: 'CoreIQ password reset code',
    text: `Your CoreIQ password reset code is ${code}. It will expire in 15 minutes.`,
    html: `
      <div style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, 'sans-serif'; background: #f6f9fe; margin:0; padding:40px 0; min-height:100vh;">
        <div style="max-width:440px;margin:40px auto; background:#fff; border-radius:18px; box-shadow:0 8px 32px rgba(27, 51, 115, .06); padding:40px 36px; text-align:center;">
          <h2 style="color:#2563eb; margin-bottom:12px; font-size: 2em; font-weight:700; letter-spacing: .5px;">Reset your CoreIQ password</h2>
          <div style="color:#475467; font-size: 1.05em; margin-bottom: 24px; border-bottom:1.5px solid #f1f1f1; padding-bottom:12px;">Use this code in the app to reset your password:</div>
          <div style="display:inline-block; background:#e4edfe; border-radius:10px; padding:18px 0; width:220px; font-size:2.4em; font-weight:600; letter-spacing:12px; color:#2563eb; margin-bottom:10px; margin-top:6px;">
            ${code}
          </div>
          <div style="color:#667085; font-size:1em; margin:30px 0 6px 0;">This code expires in 15 minutes.<br>If you didn't request to reset, you can safely ignore this.</div>
          <div style="margin:36px 0 0 0; color:#b2b2b2; font-size:.93em;">— CoreIQ Team</div>
        </div>
      </div>
    `,
  });
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { fullName, username, email, password, birthDate, gender } = req.body;

    // Validation
    if (!fullName || !username || !email || !password || !birthDate || !gender) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Create user
    const user = new User({
      fullName,
      username,
      email,
      password, // Will be hashed by pre-save hook
      birthDate,
      gender
    });

    await user.save();

    // Create default preferences
    const preferences = new UserPreferences({
      userId: user._id,
      theme: 'light',
      units: 'metric'
    });
    await preferences.save();

    // Generate email verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailVerificationToken.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        token: code,
        email: user.email,
        expiresAt: new Date(Date.now() + CODE_EXPIRY_MS), // 15 min
        used: false
      },
      { upsert: true, new: true }
    );

    await sendVerificationEmail(user.email, code);

    res.status(201).json({
      message: 'User registered successfully. Verification code sent to email.',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const start = Date.now();
  console.log(`[Login] Request received for ${req.body.email}`);
  console.log(`[Login] Mongoose ReadyState: ${mongoose.connection.readyState}`);

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const queryStart = Date.now();
    const normalizedEmail = email.trim().toLowerCase();

    // Optimize: Use lean() and select needed fields. profilePhoto REMOVED to prevent massive DB read latency.
    const user = await User.findOne({ email: normalizedEmail })
      .select('password email username fullName emailVerified birthDate gender updatedAt')
      .lean();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if photo exists (lightweight projection)
    const photoCheck = await User.exists({ _id: user._id, profilePhoto: { $exists: true, $ne: null } });
    const hasPhoto = !!photoCheck;

    console.log(`[Login] DB Query took ${Date.now() - queryStart}ms`);



    // Check password
    const cryptoStart = Date.now();
    // Manual bcrypt compare because we used .lean()
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`[Login] Password compare took ${Date.now() - cryptoStart}ms`);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Require verified email
    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    // Generate token
    const tokenStart = Date.now();
    const token = generateToken(user._id);
    console.log(`[Login] Token generation took ${Date.now() - tokenStart}ms`);

    const response = {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        // profilePhoto: user.profilePhoto, // Removed to reduce payload size
        birthDate: user.birthDate,
        gender: user.gender,
        emailVerified: user.emailVerified,
        profilePhoto: hasPhoto ? `/api/users/${user._id}/photo?v=${user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now()}` : null
      }
    };

    console.log(`[Login] Total request time: ${Date.now() - start}ms`);
    return res.json(response);
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// Forgot password - generate reset token
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    // Find user - optimize to avoid loading profilePhoto
    const user = await User.findOne({ email }).select('_id email emailVerified');
    if (!user) {
      // Don't reveal if email exists (security)
      return res.json({ message: 'If email exists, a reset code has been sent' });
    }

    // Block unverified emails from password reset
    if (!user.emailVerified) {
      return res.status(403).json({ message: 'Please verify your email before resetting password' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create or update reset token
    await PasswordResetToken.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        token: code,
        email: user.email,
        expiresAt: new Date(Date.now() + CODE_EXPIRY_MS), // 15 min
        used: false
      },
      { upsert: true, new: true }
    );

    await sendPasswordResetEmail(user.email, code);

    res.json({ message: 'If email exists, a reset code has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify reset code
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Please provide email and code' });
    }

    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      email,
      token: code,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    res.json({ message: 'Code verified successfully', token: resetToken._id });
  } catch (error) {
    console.error('Verify code error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Please provide token and new password' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Find valid token
    const resetToken = await PasswordResetToken.findById(token);
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    const user = await User.findById(resetToken.userId);
    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request email verification code (resend)
exports.requestEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email }).select('_id email emailVerified');
    if (!user) {
      // Do not reveal existence
      return res.json({ message: 'If email exists, a verification code has been sent' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'Email already verified' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await EmailVerificationToken.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        token: code,
        email: user.email,
        expiresAt: new Date(Date.now() + CODE_EXPIRY_MS), // 15 min
        used: false
      },
      { upsert: true, new: true }
    );

    await sendVerificationEmail(user.email, code);

    res.json({ message: 'If email exists, a verification code has been sent' });
  } catch (error) {
    console.error('Request email verification error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify email with code
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Please provide email and code' });
    }

    const user = await User.findOne({ email }).select('-profilePhoto');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or code' });
    }

    const tokenDoc = await EmailVerificationToken.findOne({
      userId: user._id,
      email,
      token: code,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.emailVerified = true;
    await user.save();

    tokenDoc.used = true;
    await tokenDoc.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  const start = Date.now();
  try {
    const queryStart = Date.now();

    // Optimize: Use lean() and select only needed fields
    // Removed 'profilePhoto' to prevent 18s+ load times due to large base64 strings
    const user = await User.findById(req.userId)
      .select('fullName username email birthDate gender emailVerified updatedAt createdAt weight height goalWeight activityLevel targetCalories targetProtein targetCarbs targetFats')
      .lean();

    console.log(`[GetMe] DB Query took ${Date.now() - queryStart}ms`);

    // Always provide photo URL - browser handles 404 gracefully
    if (user) {
      const timestamp = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
      user.profilePhoto = `/api/users/${user._id}/photo?v=${timestamp}`;
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform _id to id if needed, or just return as is (frontend handles _id)
    user.id = user._id;
    delete user._id;

    console.log(`[GetMe] Total request time: ${Date.now() - start}ms`);
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

