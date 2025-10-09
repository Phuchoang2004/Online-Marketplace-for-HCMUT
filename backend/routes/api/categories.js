const express = require('express');
const router = express.Router();
const { check, validationResult } = require("express-validator")
const { json } = require("express");
const Category = require("../../models/Category");


// @route POST api/category/create
// @description create category
// @access Public
router.post('/api/category/create', [
    check("name").not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF') {
        console.log(req.user.role)
        return res.status(403).json({ errors: "You dont have permission to perform this action!" });
    }
    const { name, parent } = req.body;
    try {
        category = new Category({ name, parent });
        await category.save();
        return res.status(201).json({ success: true, 'category': category });
    } catch (err) {
        return res.status(400).json({ errors: errors.array() });
    }
})
router.delete('/api/category/:id', async (req, res) => {
    const id = req.params.id;
    if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF') {
        return res.status(403).json({ errors: "You dont have permission to perform this action!" });
    }
    try {
        const result = await Category.findByIdAndDelete(id)
        if (result) {
            return res.status(200).json({ success: true, 'message': 'Category deleted successfully' });
        }
        return res.status(404).json({ errors: "Category not found" });
    } catch (err) {
        return res.status(400).json({ errors: errors.array() });
    }
})
module.exports = router;