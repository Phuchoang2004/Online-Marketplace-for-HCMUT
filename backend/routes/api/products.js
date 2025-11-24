const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 5 } });
const { check, validationResult } = require('express-validator');

const auth = require('../../middlewares/authMiddleware');
const Product = require('../../models/Product');
const Vendor = require('../../models/Vendor');
const User = require('../../models/User').default;
const Notification = require('../../models/Notification');
const AuditLog = require('../../models/AuditLog');

/* ------------------------- Helpers ------------------------- */
const isStaff = (user) => user.role === 'STAFF' || user.role === 'ADMIN';
const isVendor = (user) => user.role === 'VENDOR';

async function resolveApprovedVendorId(userJwt) {
    const user = await User.findById(userJwt.id).select('role vendorProfile');
    if (!user) throw { status: 401, msg: 'User not found' };
    if (user.role !== 'VENDOR') throw { status: 403, msg: 'Only VENDOR can perform this action' };

    let vendor = null;
    if (user.vendorProfile) {
        vendor = await Vendor.findById(user.vendorProfile).select('_id approvalStatus user');
    } else {
        vendor = await Vendor.findOne({ user: userJwt.id }).select('_id approvalStatus user');
        if (vendor) {
            user.vendorProfile = vendor._id;
            await user.save();
        }
    }

    if (!vendor) throw { status: 403, msg: 'Vendor profile not found' };
    if (vendor.approvalStatus !== 'APPROVED') throw { status: 403, msg: 'Vendor is not approved yet' };
    return vendor._id;
}

async function getVendorAndOwnerUser(vendorId) {
    const vendor = await Vendor.findById(vendorId).select('_id user');
    if (!vendor) throw { status: 404, msg: 'Vendor not found' };
    return vendor;
}

/* ===========================================================
   PRODUCT CRUD (Vendor)
   =========================================================== */

// LIST VENDOR'S OWN PRODUCTS (all statuses)
router.get('/api/vendor/products', auth, async (req, res) => {
    try {
        const vendorId = await resolveApprovedVendorId(req.user);
        const items = await Product.find({ vendor: vendorId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: items });
    } catch (e) {
        const status = e?.status || 400;
        const msg = e?.msg || e?.message || 'Bad request';
        return res.status(status).json({ errors: msg });
    }
});

// CREATE PRODUCT (Vendor đã được duyệt)
router.post(
    '/api/products',
    auth,
    upload.array('images', 5),
    [
        check('category').notEmpty().withMessage('category is required'),
        check('name').notEmpty().withMessage('name is required'),
        check('price').isFloat({ min: 0 }).withMessage('price must be >= 0'),
        check('stock').optional().isInt({ min: 0 }).withMessage('stock must be >= 0'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const vendorId = await resolveApprovedVendorId(req.user);
            const { category, name, description, price, stock } = req.body;
            let images = [];
            if (req.files && req.files.length > 0) {
                // For demo: convert to in-memory data URLs. In production, upload to storage (S3, cloudinary) and save returned URLs.
                images = req.files.map((f) => ({ url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}` }));
            } else if (req.body.images) {
                try {
                    const parsed = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
                    if (Array.isArray(parsed)) {
                        images = parsed.filter((i) => i && i.url);
                    }
                } catch (e) {
                    // ignore invalid images payload
                }
            }

            const product = await Product.create({
                vendor: vendorId,
                category,
                name,
                description,
                price,
                stock,
                images,
                approvalStatus: 'PENDING',
            });

            await AuditLog.create({
                user: req.user.id,
                action: 'CREATE',
                entityType: 'Product',
                entityId: product._id,
                details: { name, price, stock },
            });

            return res.status(201).json({ success: true, product });
        } catch (e) {
            const status = e?.status || 400;
            const msg = e?.msg || e?.message || 'Bad request';
            return res.status(status).json({ errors: msg });
        }
    }
);

// UPDATE PRODUCT (reset về PENDING)
router.put(
    '/api/products/:id',
    auth,
    [check('price').optional().isFloat({ min: 0 }), check('stock').optional().isInt({ min: 0 })],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const vendorId = await resolveApprovedVendorId(req.user);
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ errors: 'Product not found' });

            if (product.vendor.toString() !== vendorId.toString()) {
                return res.status(403).json({ errors: 'Not owner of this product' });
            }

            const allowed = ['category', 'name', 'description', 'price', 'stock', 'images'];
            for (const k of allowed) if (k in req.body) product[k] = req.body[k];

            product.approvalStatus = 'PENDING';
            product.rejectionReason = null;
            product.approvedBy = null;
            product.approvedAt = null;

            await product.save();

            await AuditLog.create({
                user: req.user.id,
                action: 'UPDATE',
                entityType: 'Product',
                entityId: product._id,
                details: req.body,
            });

            return res.json({ success: true, product });
        } catch (e) {
            const status = e?.status || 400;
            const msg = e?.msg || e?.message || 'Bad request';
            return res.status(status).json({ errors: msg });
        }
    }
);

// DELETE PRODUCT
router.delete('/api/products/:id', auth, async (req, res) => {
    try {
        const vendorId = await resolveApprovedVendorId(req.user); // ✅
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ errors: 'Product not found' });

        if (product.vendor.toString() !== vendorId.toString()) {
            return res.status(403).json({ errors: 'Not owner of this product' });
        }

        await product.deleteOne();

        await AuditLog.create({
            user: req.user.id,
            action: 'DELETE',
            entityType: 'Product',
            entityId: product._id,
        });

        return res.json({ success: true, message: 'Product deleted' });
    } catch (e) {
        const status = e?.status || 400;
        const msg = e?.msg || e?.message || 'Bad request';
        return res.status(status).json({ errors: msg });
    }
});

/* ===========================================================
   PRODUCT READ
   =========================================================== */

router.get('/api/products/:id', auth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('vendor category approvedBy');
        if (!product) return res.status(404).json({ errors: 'Product not found' });


        let canView = product.approvalStatus === 'APPROVED' || isStaff(req.user);
        if (!canView && isVendor(req.user)) {
            const vendorId = await resolveApprovedVendorId(req.user);
            canView = product.vendor.toString() === vendorId.toString();
        }
        if (!canView) return res.status(403).json({ errors: 'Forbidden' });

        return res.json({ success: true, product });
    } catch (e) {
        const status = e?.status || 400;
        const msg = e?.msg || e?.message || 'Bad request';
        return res.status(status).json({ errors: msg });
    }
});

// BROWSE APPROVED PRODUCTS (Public)
router.get('/api/products', async (req, res) => {
    try {
        const { keyword, category, sortBy = 'newest', page = 1, limit = 12 } = req.query;

        const filter = { approvalStatus: 'APPROVED' };
        if (keyword) filter.name = { $regex: keyword, $options: 'i' };
        if (category) filter.category = category;

        const sortMap = {
            price: { price: 1 },
            newest: { createdAt: -1 },
            popularity: { createdAt: -1 },
        };

        const skip = (Number(page) - 1) * Number(limit);

        const [items, total] = await Promise.all([
            Product.find(filter).sort(sortMap[sortBy] || sortMap.newest).skip(skip).limit(Number(limit)),
            Product.countDocuments(filter),
        ]);

        return res.json({
            success: true,
            data: items,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (e) {
        return res.status(400).json({ errors: e.message });
    }
});

/* ===========================================================
   PRODUCT APPROVAL (Staff)
   =========================================================== */

// LIST PENDING PRODUCTS
router.get('/api/products-pending', auth, async (req, res) => {
    if (!isStaff(req.user)) return res.status(403).json({ errors: 'Only staff can view pending list' });

    try {
        const items = await Product.find({ approvalStatus: 'PENDING' }).populate('vendor category');
        return res.json({ success: true, data: items });
    } catch (e) {
        return res.status(400).json({ errors: e.message });
    }
});

// APPROVE PRODUCT
router.post('/api/products/:id/approve', auth, async (req, res) => {
    if (!isStaff(req.user)) return res.status(403).json({ errors: 'Only staff can approve' });

    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ errors: 'Product not found' });

        product.approvalStatus = 'APPROVED';
        product.rejectionReason = null;
        product.approvedBy = req.user.id;
        product.approvedAt = new Date();
        await product.save();

        const vendor = await getVendorAndOwnerUser(product.vendor);
        await Notification.create({
            user: vendor.user,
            type: 'PRODUCT_APPROVAL',
            message: `Your product "${product.name}" has been approved.`,
        });

        await AuditLog.create({
            user: req.user.id,
            action: 'APPROVE',
            entityType: 'Product',
            entityId: product._id,
        });

        return res.json({ success: true, message: 'Product approved' });
    } catch (e) {
        const status = e?.status || 400;
        const msg = e?.msg || e?.message || 'Bad request';
        return res.status(status).json({ errors: msg });
    }
});

// REJECT PRODUCT (with feedback)
router.post(
    '/api/products/:id/reject',
    auth,
    [check('reason').notEmpty().withMessage('reason is required')],
    async (req, res) => {
        if (!isStaff(req.user)) return res.status(403).json({ errors: 'Only staff can reject' });

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const product = await Product.findById(req.params.id);
            if (!product) return res.status(404).json({ errors: 'Product not found' });

            product.approvalStatus = 'REJECTED';
            product.rejectionReason = req.body.reason;
            product.approvedBy = req.user.id;
            product.approvedAt = new Date();
            await product.save();

            const vendor = await getVendorAndOwnerUser(product.vendor);
            await Notification.create({
                user: vendor.user,
                type: 'PRODUCT_APPROVAL',
                message: `Your product "${product.name}" was rejected. Reason: ${req.body.reason}`,
            });

            await AuditLog.create({
                user: req.user.id,
                action: 'REJECT',
                entityType: 'Product',
                entityId: product._id,
                details: { reason: req.body.reason },
            });

            return res.json({ success: true, message: 'Product rejected' });
        } catch (e) {
            const status = e?.status || 400;
            const msg = e?.msg || e?.message || 'Bad request';
            return res.status(status).json({ errors: msg });
        }
    }
);

module.exports = router;
