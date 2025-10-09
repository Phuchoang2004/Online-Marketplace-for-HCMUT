const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const { check, validationResult } = require('express-validator');

// @route GET api/products
// @description Get all products with search, filtering, and pagination
// @access Public
router.get('/api/products', [
    check('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    check('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    check('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
    check('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
    check('sortBy').optional().isIn(['price', 'name', 'createdAt', 'stock']).withMessage('Invalid sort field'),
    check('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        // Extract query parameters
        const {
            search,
            category,
            vendor,
            minPrice,
            maxPrice,
            inStock,
            approvalStatus = 'APPROVED',
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // Build filter object
        const filter = { approvalStatus };

        // Text search in name and description
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Vendor filter
        if (vendor) {
            filter.vendor = vendor;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Stock filter
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        } else if (inStock === 'false') {
            filter.stock = { $eq: 0 };
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build sort object
        const sortOrder = order === 'desc' ? -1 : 1;
        const sort = { [sortBy]: sortOrder };

        // Execute query with pagination
        const [products, totalProducts] = await Promise.all([
            Product.find(filter)
                .populate('vendor', 'name')
                .populate('category', 'name')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Product.countDocuments(filter)
        ]);

        // Calculate pagination info
        const totalPages = Math.ceil(totalProducts / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        return res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalProducts,
                    limit: limitNum,
                    hasNextPage,
                    hasPrevPage
                },
                filters: {
                    search,
                    category,
                    vendor,
                    minPrice,
                    maxPrice,
                    inStock,
                    approvalStatus,
                    sortBy,
                    order
                }
            }
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching products'
        });
    }
});

// @route GET api/products/:id
// @description Get single product by ID
// @access Public
router.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('vendor', 'name email')
            .populate('category', 'name')
            .populate('approvedBy', 'fullName');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Error fetching product:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Server error while fetching product'
        });
    }
});

module.exports = router;