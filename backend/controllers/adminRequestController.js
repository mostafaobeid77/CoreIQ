const AdminRequest = require('../models/AdminRequest');
const Admin = require('../models/Admin');
const { sendMail } = require('../utils/mailer');
const crypto = require('crypto');

// Submit a new request
exports.submitRequest = async (req, res) => {
    try {
        const { username, email, reason, availability, department, experience, cvLink } = req.body;

        // Check if there is already a pending request for this email
        const existingRequest = await AdminRequest.findOne({ email, status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ message: 'A pending request already exists for this email.' });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return res.status(400).json({ message: 'An admin with this email or username already exists.' });
        }

        const request = new AdminRequest({
            username,
            email,
            reason,
            availability,
            department,
            experience,
            cvLink
        });

        await request.save();

        res.status(201).json({ message: 'Request submitted successfully. You will be notified via email.' });
    } catch (error) {
        console.error('Submit admin request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all requests (Super Admin only)
exports.getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const query = {};
        if (status) query.status = status;

        const requests = await AdminRequest.find(query).sort({ createdAt: -1 });
        res.json({ requests });
    } catch (error) {
        console.error('Get admin requests error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Approve request
exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await AdminRequest.findById(id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Request is already ${request.status}` });
        }

        // Standardized Credentials
        const password = 'CoreIQAdmin2026'; // Must be > 8 chars
        const officialEmail = `${request.username.toLowerCase()}@coreiq.com`;

        // Check if admin already exists (Collision Check)
        const existingAdmin = await Admin.findOne({
            $or: [{ username: request.username }, { email: officialEmail }]
        });
        if (existingAdmin) {
            return res.status(400).json({
                message: `Cannot approve: Admin with username '${request.username}' or email '${officialEmail}' already exists.`
            });
        }

        // Create Admin
        const admin = new Admin({
            username: request.username,
            email: officialEmail,
            password,
            role: 'admin',
            createdBy: req.admin._id
        });

        await admin.save();

        // Update Request
        request.status = 'approved';
        request.reviewedBy = req.admin._id;
        request.reviewedAt = new Date();
        await request.save();

        // Send Email to APPLICANT'S personal email
        let emailStatus = 'sent';
        try {
            console.log(`Sending approval email to: ${request.email}`);
            await sendMail({
                to: request.email,
                subject: 'Welcome to CoreIQ Admin Team',
                text: `Congratulations! You have been accepted.\n\nYour Admin Login Details:\nUsername: ${request.username}\nEmail: ${officialEmail}\nTemporary Password: ${password}\n\nIMPORTANT: Please login to the Admin Dashboard and change your password immediately.`,
                html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4f46e5;">Welcome to the Team!</h2>
            <p>Your request to become an admin has been approved.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Username:</strong> ${request.username}</p>
                <p style="margin: 5px 0;"><strong>Official Email:</strong> ${officialEmail}</p>
                <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${password}</p>
            </div>

            <p style="color: #ef4444; font-weight: bold;">IMPORTANT: Please login and change your password immediately.</p>
            </div>
        `
            });
        } catch (mailError) {
            console.error('Failed to send approval email:', mailError);
            emailStatus = 'failed';
        }

        res.json({
            message: emailStatus === 'sent'
                ? 'Request approved and admin account created.'
                : 'Admin created, but failed to send email notification.'
        });
    } catch (error) {
        console.error('Approve request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject request
exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const request = await AdminRequest.findById(id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: `Request is already ${request.status}` });
        }

        // Update Request
        request.status = 'rejected';
        request.rejectionReason = reason;
        request.reviewedBy = req.admin._id;
        request.reviewedAt = new Date();
        await request.save();

        // Send (Professional) Email
        await sendMail({
            to: request.email,
            subject: 'Update on your CoreIQ Admin Application',
            text: `Dear ${request.username},\n\nThank you for your interest in joining the CoreIQ team. We appreciate the time you took to apply.\n\nAfter careful review, we are unable to approve your request for admin access at this time.\n\nReason: ${reason}\n\nWe successfully received your application but determined that it does not align with our current requirements.\n\nBest regards,\nThe CoreIQ Team`,
            html: `
            <div style="font-family: 'Segoe UI', user-select: none; sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">CoreIQ</h2>
                    <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Admin Recruitment Team</p>
                </div>

                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <p style="margin-top: 0; font-size: 16px;">Dear <strong>${request.username}</strong>,</p>
                    
                    <p style="line-height: 1.6;">Thank you for your interest in joining the <strong>CoreIQ</strong> administrative team. We genuinely appreciate the time and effort you put into your application.</p>
                    
                    <p style="line-height: 1.6;">After a careful review of your submission, we are writing to inform you that we are unable to proceed with your application at this time.</p>

                    <div style="background: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="color: #991b1b; font-size: 13px; font-weight: 600; uppercase; tracking: wide; margin: 0 0 4px 0;">DECISION REASON</p>
                        <p style="color: #7f1d1d; margin: 0; font-size: 15px;">${reason}</p>
                    </div>

                    <p style="line-height: 1.6;">Please note that this decision is specific to our current needs and requirements. We wish you the very best in your future professional endeavors.</p>
                </div>

                <div style="text-align: center; margin-top: 30px; font-size: 13px; color: #94a3b8;">
                    <p>&copy; ${new Date().getFullYear()} CoreIQ. All rights reserved.<br>
                    This is an automated message, please do not reply directly to this email.</p>
                </div>
            </div>
            `
        });

        res.json({ message: 'Request rejected.' });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Delete Request (Cleanup)
exports.deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await AdminRequest.findByIdAndDelete(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request deleted permanently' });
    } catch (error) {
        console.error('Delete request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
