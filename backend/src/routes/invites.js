const express = require('express');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { authenticateToken, requireLead, requireVerified } = require('../middleware/auth');

const router = express.Router();

// Send invitation to member
router.post('/send', authenticateToken, requireLead, requireVerified, async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ message: 'Email, first name, and last name are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create member account first
    const tempPassword = Math.random().toString(36).slice(-8);
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const userId = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'member',
      parentOrgId: req.user.parentOrgId
    });

    // Send invitation email
    const inviterName = `${req.user.firstName} ${req.user.lastName}`;
    const orgName = 'Your Organization'; // You can customize this based on your org structure
    
    const emailSent = await emailService.sendInvite(email, inviterName, orgName);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send invitation email' });
    }

    res.json({ 
      message: 'Invitation sent successfully',
      memberId: userId
    });
  } catch (error) {
    console.error('Send invite error:', error);
    res.status(500).json({ message: 'Failed to send invitation' });
  }
});

// Accept invitation and set password
router.post('/accept', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid invitation' });
    }

    if (user.role !== 'member') {
      return res.status(400).json({ message: 'Invalid invitation type' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already activated' });
    }

    // Update password and verification status
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const db = require('../config/database');
    await db.execute(
      'UPDATE users SET password = ?, is_verified = ? WHERE id = ?',
      [hashedPassword, true, user.id]
    );

    res.json({ message: 'Account activated successfully' });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ message: 'Failed to activate account' });
  }
});

// Get invitation status
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'No invitation found for this email' });
    }

    res.json({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
      role: user.role
    });
  } catch (error) {
    console.error('Get invite status error:', error);
    res.status(500).json({ message: 'Failed to get invitation status' });
  }
});

module.exports = router;
