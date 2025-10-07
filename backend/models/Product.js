import mongoose from 'mongoose';

const ProductImageSchema = new mongoose.Schema({
    url: { type: String, required: true },
}, {_id: false});

const ProductSchema = new mongoose.Schema({
    vendor: {type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' , required: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category' , required: true },
    name: { type: String, required: true },
    description: { type: Text},
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0 },
    images: [ProductImageSchema],
    approvalStatus: {type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'},
    rejectionReason: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
}, {timestamps: true});

export default mongoose.model('Product', ProductSchema);