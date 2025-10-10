const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    businessName: {type: String, required: true},
    description: {type: Text},
    approvalStatus:{type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'},
    rejectionReason: { type: String },
    approvedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    approvedAt: {type: Date},
    suspended: {type: Boolean, default: false},
}, { timestamps: true });

module.exports = Vendor = mongoose.model('Vendor', VendorSchema);