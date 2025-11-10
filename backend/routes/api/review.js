const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/authMiddleware');
const Review = require('../../models/Review');
const Order = require("../../models/Order");


router.get('/api/product/review/:productId', auth, async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.find({ product: productId })
            .populate('user', 'fullName')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/api/product/review', auth, async (req, res) => {
    try{
        const { productId, rating, comment } = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const completedOrder = await Order.findOne({
            user: userId,
            'items.product': productId,
            status: 'COMPLETED'
        });

        if (!completedOrder) {
            return res.status(403).json({
                error: 'You can only review products from completed orders'
            });
        }

        const existingReview = await Review.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(400).json({ error: 'You have already reviewed this product' });
        }

        const review = new Review({
            product: productId,
            user: userId,
            rating,
            comment
        });

        await review.save();

        res.status(201).json({ message: 'Review created successfully', review });
    }catch(err){
        res.status(500).json({success: false, message: err.message});
    }
})

module.exports = router;