const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    address: { type: String },
    phoneNumber: { type: String },

    role: {
        type: String,
        enum: ['CUSTOMER', 'VENDOR', 'STAFF', 'ADMIN'],
        default: 'CUSTOMER'
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },

    vendorProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        default: undefined
    },

    permissions: ['APPROVE_VENDOR', 'MANAGE_CATEGORY', 'APPROVE_PRODUCT'],
}, { timestamps: true });

UserSchema.index(
    { vendorProfile: 1 },
    { unique: true, partialFilterExpression: { vendorProfile: { $type: 'objectId' } } }
);

module.exports = mongoose.model('User', UserSchema);
