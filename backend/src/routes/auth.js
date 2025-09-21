const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register Lead/Admin
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'lead' } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (role !== 'lead') {
      return res.status(400).json({ message: 'Only lead role allowed for registration' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      parentOrgId: null // Will be set after verification
    });

    // Generate and send OTP
    const otp = generateOTP();
    otpStore.set(email, { otp, userId, expires: Date.now() + 10 * 60 * 1000 }); // 10 minutes

    const emailSent = await emailService.sendOTP(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ 
      message: 'Registration successful. Please check your email for verification code.',
      userId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Verify OTP
router.post('/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (Date.now() > storedData.expires) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update user verification status
    await User.updateVerificationStatus(storedData.userId, true);

    // Set parent_org_id to self for the first lead
    const user = await User.findById(storedData.userId);
    if (!user.parentOrgId) {
      // This is the first lead, set parent_org_id to their own ID
      const db = require('../config/database');
      await db.execute('UPDATE users SET parent_org_id = ? WHERE id = ?', [storedData.userId, storedData.userId]);
    }

    // Clean up OTP
    otpStore.delete(email);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Email verification required' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Generate and send new OTP
    const otp = generateOTP();
    otpStore.set(email, { otp, userId: user.id, expires: Date.now() + 10 * 60 * 1000 });

    const emailSent = await emailService.sendOTP(email, otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

module.exports = router;
