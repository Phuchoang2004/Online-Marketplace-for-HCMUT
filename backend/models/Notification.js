const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['VENDOR_APPROVAL', 'PRODUCT_APPROVAL', 'ORDER_STATUS', 'MESSAGE']
    },
    message: { type: Text, required: true },
    isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = Notification = mongoose.model('Notification', NotificationSchema);