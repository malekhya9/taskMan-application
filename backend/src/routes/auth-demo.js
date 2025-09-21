const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Demo-friendly registration (no email verification)
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
      parentOrgId: null
    });

    // Auto-verify for demo
    await User.updateVerificationStatus(userId, true);

    // Set parent_org_id to self for the first lead
    const user = await User.findById(userId);
    if (!user.parentOrgId) {
      const db = require('../config/database');
      await db.execute('UPDATE users SET parent_org_id = ? WHERE id = ?', [userId, userId]);
    }

    res.json({ 
      message: 'Registration successful. Account auto-verified for demo.',
      userId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Demo-friendly login
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

module.exports = router;
