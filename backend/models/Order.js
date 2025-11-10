const mongoose = require('mongoose');
const OrderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    // paymentStatus: {
    //     type: String,
    //     enum: ['PENDING', 'SUCCESS', 'FAILED'],
    //     default: 'PENDING'
    // },
    // paymentId: { type: String } // Stripe payment reference

}, { timestamps: true });

module.exports = Order = mongoose.model('Order', OrderSchema);