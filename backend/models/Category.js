const mongoose = require('mongoose');
const CategorySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
}, { timestamps: true });

module.exports = Category = mongoose.model('Category', CategorySchema);