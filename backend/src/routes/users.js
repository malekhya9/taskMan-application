const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticateToken, requireLead, requireVerified } = require('../middleware/auth');

const router = express.Router();

// Get all users in organization
router.get('/', authenticateToken, requireVerified, async (req, res) => {
  try {
    const users = await User.getUsersByOrg(req.user.parentOrgId);
    const usersWithoutPasswords = users.map(user => user.toJSON());
    
    res.json({ users: usersWithoutPasswords });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get leads in organization
router.get('/leads', authenticateToken, requireVerified, async (req, res) => {
  try {
    const leads = await User.getLeadsByOrg(req.user.parentOrgId);
    const leadsWithoutPasswords = leads.map(lead => lead.toJSON());
    
    res.json({ leads: leadsWithoutPasswords });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
});

// Get members in organization
router.get('/members', authenticateToken, requireVerified, async (req, res) => {
  try {
    const members = await User.getMembersByOrg(req.user.parentOrgId);
    const membersWithoutPasswords = members.map(member => member.toJSON());
    
    res.json({ members: membersWithoutPasswords });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
});

// Create new lead (Lead only)
router.post('/leads', authenticateToken, requireLead, requireVerified, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create lead user
    const userId = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'lead',
      parentOrgId: req.user.parentOrgId
    });

    // Update verification status (leads created by other leads are auto-verified)
    await User.updateVerificationStatus(userId, true);

    const newLead = await User.findById(userId);
    res.status(201).json({ 
      message: 'Lead created successfully', 
      lead: newLead.toJSON() 
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Failed to create lead' });
  }
});

// Create member account (invite-only, no direct creation)
router.post('/members', authenticateToken, requireLead, requireVerified, async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate temporary password (user will set their own password during signup)
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Create member user
    const userId = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'member',
      parentOrgId: req.user.parentOrgId
    });

    const newMember = await User.findById(userId);
    res.status(201).json({ 
      message: 'Member account created. They will receive an invitation email.',
      member: newMember.toJSON() 
    });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ message: 'Failed to create member' });
  }
});

// Update user profile
router.patch('/profile', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const db = require('../config/database');

    if (firstName) {
      await db.execute('UPDATE users SET first_name = ? WHERE id = ?', [firstName, req.user.id]);
    }
    if (lastName) {
      await db.execute('UPDATE users SET last_name = ? WHERE id = ?', [lastName, req.user.id]);
    }

    const updatedUser = await User.findById(req.user.id);
    res.json({ 
      message: 'Profile updated successfully', 
      user: updatedUser.toJSON() 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password
router.patch('/password', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    const db = require('../config/database');
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

module.exports = router;
