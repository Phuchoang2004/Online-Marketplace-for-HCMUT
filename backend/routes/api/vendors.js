const express = require('express');
const router = express.Router();
const {check, validationResult} = require("express-validator")
const {json} = require("express");
const Vendor = require("../../models/Vendor");


router.get("/", async (req, res) => {
    res.status(200).json(req.user);
})

// @route POST api/vendor/register
// @description register vendor
// @access Public
router.post('/api/vendor/register',[
    check('business_name').not().isEmpty(),
], async (req, res) => {
    if(req.user.role !== 'CUSTOMER'){
        return res.status(400).json({errors: "Only customer can register vendor"})
    }
    console.log(req.user)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const { business_name , description} = req.body;
    try {
        vendor = new Vendor({user:req.user.id ,businessName: business_name, description});
        await vendor.save();
        return res.status(201).json({"success": true, "message": "Please wait for approval", "information": vendor});
    }catch (error) {
        console.log(error);
        process.exit(1);
    }
})

module.exports = router;