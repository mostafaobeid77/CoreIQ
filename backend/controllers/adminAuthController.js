/* eslint-disable prettier/prettier */
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin-secret-key';
const ADMIN_JWT_EXPIRY = process.env.ADMIN_JWT_EXPIRY || '2d';

const createAdminToken = (adminId) =>
  jwt.sign({ adminId, role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRY });

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email or username and password' });
    }

    const normalizedIdentifier = identifier.trim();
    const query = normalizedIdentifier.includes('@')
      ? { email: normalizedIdentifier.toLowerCase() }
      : { username: normalizedIdentifier };

    const admin = await Admin.findOne(query);

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createAdminToken(admin._id.toString());

    return res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error.message);
    return res.status(500).json({
      message: 'Server error during admin login',
      error: error.message,
    });
  }
};


