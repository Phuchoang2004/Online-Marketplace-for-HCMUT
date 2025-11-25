const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/authMiddleware');
const Order = require('../../models/Order');

router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    let orders;
    const filter = {};
    const { type } = req.query;

    if (user.role === 'VENDOR') {
        filter['items.vendor'] = user.vendorProfile;
        if (type) filter['items.status'] = type.toUpperCase();
      orders = await Order.find(filter)
        .populate('user', 'fullName email')
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 });
    }else{
        res.status(403).json({ success: false, message: 'Unauthorized role' });
        return;
    }
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('[List Orders Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my', auth, async (req, res) => {
    try{
        const user = req.user;
        let orders;
        const filter = {};
        const { type } = req.query;
        filter.user = user.id;
        if (type) filter.status = type.toUpperCase();
        orders = await Order.find(filter)
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    }catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const user = req.user;
    const order = await Order.findById(req.params.id)
      .populate('user', 'fullName email')
      .populate('items.product', 'name price')
      .populate('items.vendor', 'businessName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isCustomer = order.user._id.toString() === user.id;
    const isVendor =
      user.role === 'VENDOR' &&
      order.items.some(i => i.vendor && i.vendor._id.toString() === user.vendorProfile);

    if (!isCustomer && !isVendor) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('[Order Detail Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id/process', auth, async (req, res) => {
  try {
    const { action } = req.body
    const user = req.user;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (user.role === 'VENDOR') {
      const ownsItem = order.items.some(i =>
        i.vendor && i.vendor.toString() === user.vendorProfile?.toString()
      );
      if (!ownsItem) {
        return res.status(403).json({
          success: false,
          message: `Vendor not in this order (vendorProfile=${user.vendorProfile})`,
        });
      }


      if (order.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: 'Order already processed' });
      }

      order.status = 'SHIPPED';
      order.items.forEach(i => {
        if (i.vendor.toString() === user.vendorProfile) i.status = 'SHIPPED';
      });
    }

    else if (user.role === 'CUSTOMER') {
        if (!action){
            return res.status(400).json({ success: false, message: 'Action is required' });
        }
      if (action.toUpperCase() === 'CANCEL' && order.status === 'PENDING') {
        order.status = 'CANCELLED';
        order.items.forEach(i => (i.status = 'CANCELLED'));
      } else if (action.toUpperCase() === 'COMPLETE' && order.status === 'SHIPPED') {
        order.status = 'COMPLETED';
        order.items.forEach(i => (i.status = 'COMPLETED'));
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action for current status or role',
        });
      }
    }

    else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    await order.save();
    res.status(200).json({
      success: true,
      message: 'Order processed successfully',
      newStatus: order.status,
    });
  } catch (error) {
    console.error('[Process Order Error]', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
