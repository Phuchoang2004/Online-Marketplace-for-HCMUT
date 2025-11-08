const express = require('express');
const router = express.Router();
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const auth = require('../../middlewares/authMiddleware');


router.get('/api/cart', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
            .populate({
                path: 'items.product',
                select: 'name price images stock'
            });

        if (!cart) {
            return res.status(200).json({ items: [] });
        }

        res.json(cart);
    } catch (err) {
        console.error('Error viewing cart:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/api/cart/add', async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (product.stock < quantity) {
            return res.status(400).json({ error: 'Not enough stock available' });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: [{ product: productId, quantity }],
            });
        } else {
            const existingItem = cart.items.find(item => item.product.toString() === productId);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity });
            }
        }

        await cart.save();
        const populatedCart = await cart.populate({
            path: 'items.product',
            select: 'name price images stock approvalStatus'
        });

        res.json(populatedCart);
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/api/cart/:productId', async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) return res.status(400).json({ error: 'Quantity must be > 0' });

    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        const item = cart.items.find(i => i.product.toString() === productId);
        if (!item) return res.status(404).json({ error: 'Item not in cart' });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (quantity > product.stock) {
            return res.status(400).json({ error: 'Not enough stock available' });
        }

        item.quantity = quantity;
        await cart.save();

        const populatedCart = await cart.populate({
            path: 'items.product',
            select: 'name price images stock'
        });

        res.json(populatedCart);
    } catch (err) {
        console.error('Error updating quantity:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/api/cart/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });

        cart.items = cart.items.filter(i => i.product.toString() !== productId);
        await cart.save();

        const populatedCart = await cart.populate({
            path: 'items.product',
            select: 'name price images stock'
        });

        res.json(populatedCart);
    } catch (err) {
        console.error('Error removing item:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/api/cart-clear', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        cart.items = [];
        await cart.save();
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('Error clearing cart:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;