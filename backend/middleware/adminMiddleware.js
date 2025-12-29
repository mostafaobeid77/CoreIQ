/* eslint-disable prettier/prettier */
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || 'admin-secret-key';

/**
 * Middleware to verify admin JWT token
 */
exports.requireAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, ADMIN_JWT_SECRET);

        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        if (!admin.isActive) {
            return res.status(403).json({ message: 'Account has been deactivated' });
        }

        req.admin = admin;
        req.adminId = admin._id;
        req.adminRole = admin.role;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        console.error('Admin auth error:', error.message);
        return res.status(500).json({ message: 'Server error during authentication' });
    }
};

/**
 * Middleware to verify superadmin role
 * Must be used AFTER requireAdmin
 */
exports.requireSuperadmin = (req, res, next) => {
    if (req.adminRole !== 'superadmin') {
        return res.status(403).json({ message: 'Superadmin access required' });
    }
    next();
};
