import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },

    role: {
        type: String,
        enum: ['CUSTOMER', 'VENDOR', 'STAFF', 'ADMIN'],
        default: 'CUSTOMER'
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    permissions: ['APPROVE_VENDOR', 'MANAGE_CATEGORY', 'APPROVE_PRODUCT'],
    vendorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }

}, { timestamps: true });

export default mongoose.model('User', UserSchema);