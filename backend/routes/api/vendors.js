const express = require('express');
const router = express.Router();
const { checkSchema, validationResult, check } = require('express-validator');

const auth = require('../../middlewares/authMiddleware');
const Vendor = require('../../models/Vendor');
const User = require('../../models/User');
// const AuditLog = require('../../models/AuditLog');

// =========================================
// Validation schema
//  =========================================
const vendorValidationSchema = {
    business_name: { notEmpty: { errorMessage: 'Business name is required' } },
    description: { optional: true, isString: { errorMessage: 'Description must be a string' } },
};

// =========================================
// GET /api/vendors (list all or filter by status)
// Only STAFF/ADMIN
// =========================================
router.get('/api/vendors', auth, async (req, res) => {
    try {
        const { status } = req.query; // optional: PENDING | APPROVED | REJECTED
        const filter = {};
        if (req.user.role === 'USER') {
            filter.user = req.user.id;
            filter.approvalStatus = 'PENDING';
            const items = await Vendor.find(filter)
                .populate('user', 'fullName email')
                .lean();
            return res.json({ success: true, data: items });
        }
        if (status) filter.approvalStatus = status;


        const items = await Vendor.find(filter)
            .populate('user', 'fullName email')
            .lean();
        return res.json({ success: true, data: items });
    } catch (err) {
        return res.status(400).json({ errors: err.message });
    }
});

// =========================================
// GET /api/vendor/:id
// =========================================
router.get('/api/vendors/:id', auth, async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id)
            .populate('user', 'fullName email role')
            .lean();
        if (!vendor) {
            return res.status(404).json({ errors: 'Vendor not found' });
        }
        return res.json({ success: true, data: vendor });
    } catch (err) {
        return res.status(400).json({ errors: err.message });
    }
});

// =========================================
// POST /api/vendor/register
// =========================================
router.post('/api/vendor/register', auth, checkSchema(vendorValidationSchema), async (req, res) => {
    if (req.user.role !== 'CUSTOMER') {
        return res.status(403).json({ errors: 'Only CUSTOMER can register vendor' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { business_name, description } = req.body;

    try {
        const user = await User.findById(req.user.id, 'vendorProfile');
        if (user?.vendorProfile) {
            return res.status(403).json({ errors: 'You already registered a vendor' });
        }

        const existed = await Vendor.findOne({
            user: req.user.id,
            approvalStatus: { $in: ['PENDING', 'APPROVED'] },
        }).lean();

        if (existed) {
            return res.status(403).json({ errors: 'You already have a vendor registration pending or approved' });
        }
        console.log(req.user.id)
        const vendor = await Vendor.create({
            user: req.user.id,
            businessName: business_name,
            description,
            approvalStatus: 'PENDING',
        });

        // await AuditLog.create({
        //   user: req.user.id,
        //   action: 'CREATE',
        //   entityType: 'Vendor',
        //   entityId: vendor._id,
        // });

        return res.status(201).json({
            success: true,
            message: 'Vendor submitted. Please wait for staff approval.',
            information: vendor,
        });
    } catch (err) {
        return res.status(400).json({ errors: err.message });
    }
});

// =========================================
// POST /api/vendor/:id/approve
// =========================================
router.post('/api/vendor/:id/approve', auth, async (req, res) => {
    if (!['STAFF', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ errors: 'Only staff/admin can approve' });
    }

    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) return res.status(404).json({ errors: 'Vendor not found' });

        if (vendor.approvalStatus === 'APPROVED') {
            return res.json({ success: true, message: 'Vendor already approved' });
        }

        vendor.approvalStatus = 'APPROVED';
        vendor.approvedBy = req.user.id;
        vendor.approvedAt = new Date();
        await vendor.save();

        let updatedUser;
        try {
            updatedUser = await User.findByIdAndUpdate(
                vendor.user,
                { $set: { role: 'VENDOR', vendorProfile: vendor._id } },
                { new: true }
            );
        } catch (e) {
            if (e?.code === 11000) {
                return res.status(409).json({
                    errors: 'Duplicate vendorProfile index. Ensure user schema uses a partial unique index for vendorProfile.',
                });
            }
            throw e;
        }

        // await AuditLog.create({
        //   user: req.user.id,
        //   action: 'APPROVE',
        //   entityType: 'Vendor',
        //   entityId: vendor._id,
        //   details: { user: updatedUser?._id },
        // });

        return res.json({
            success: true,
            message: 'Vendor approved',
            user: {
                id: updatedUser?._id,
                role: updatedUser?.role,
                vendorProfile: updatedUser?.vendorProfile,
            },
        });
    } catch (err) {
        return res.status(400).json({ errors: err.message });
    }
});

// =========================================
// POST /api/vendor/:id/reject
// ========================================= 
router.post(
    '/api/vendor/:id/reject',
    auth,
    [check('reason').notEmpty().withMessage('reason required')],
    async (req, res) => {
        if (!['STAFF', 'ADMIN'].includes(req.user.role)) {
            return res.status(403).json({ errors: 'Only staff/admin can reject' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const vendor = await Vendor.findById(req.params.id);
            if (!vendor) return res.status(404).json({ errors: 'Vendor not found' });

            vendor.approvalStatus = 'REJECTED';
            vendor.rejectionReason = req.body.reason;
            vendor.approvedBy = req.user.id;
            vendor.approvedAt = new Date();
            await vendor.save();

            // await AuditLog.create({
            //   user: req.user.id,
            //   action: 'REJECT',
            //   entityType: 'Vendor',
            //   entityId: vendor._id,
            //   details: { reason: req.body.reason },
            // });

            return res.json({ success: true, message: 'Vendor rejected' });
        } catch (err) {
            return res.status(400).json({ errors: err.message });
        }
    }
);

module.exports = router;
