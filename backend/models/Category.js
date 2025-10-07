import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema);