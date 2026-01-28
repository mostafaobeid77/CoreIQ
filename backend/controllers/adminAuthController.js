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

exports.getMe = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    return res.json({
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Get Me error:', error.message);
    return res.status(500).json({
      message: 'Server error fetching admin details',
      error: error.message,
    });
  }
};

exports.listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json({ admins });
  } catch (error) {
    console.error('List admins error:', error);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const { username, emailPrefix, password } = req.body;

    // Check if exists
    const fullEmail = `${emailPrefix}@coreiq.com`;
    const existing = await Admin.findOne({ $or: [{ username }, { email: fullEmail }] });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const admin = new Admin({
      username,
      email: fullEmail,
      password,
      role: 'admin',
      createdBy: req.admin._id
    });

    await admin.save();
    res.status(201).json({ message: 'Admin created', admin });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error creating admin' });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.admin._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Cascade delete: Remove associated request if it exists
    try {
      const AdminRequest = require('../models/AdminRequest');
      // Delete case-insensitive username match or email match
      await AdminRequest.deleteMany({
        $or: [
          { email: admin.email },
          { username: { $regex: new RegExp(`^${admin.username}$`, 'i') } }
        ]
      });
      console.log(`Cascade deleted requests for ${admin.username}`);
    } catch (e) {
      console.warn('Cascade delete of AdminRequest failed (ignoring):', e.message);
    }

    await Admin.findByIdAndDelete(id);
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error deleting admin' });
  }
};



