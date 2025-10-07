const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');
const {check, validationResult} = require("express-validator")
const {json} = require("express");
const auth = require("../../middlewares/authMiddleware");
// @route GET api/users
// @description test rout
// @access Public
router.get('/', auth, async (req, res) => res.send('User Route'));

// @route POST api/users
// @description register
// @access Public
router.post('/',[
    check('email', 'Email is invalid').isEmail(),
    check('password', 'password must in range 6-32 chars').isLength({min:6, max:32}),
    check('name', 'name cant be empty').not().isEmpty(),
    check('age','age cant be empty').not().isEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const { name, email, password, age } = req.body;
    try {
        let user = await User.findOne({email})
        if (user) {
            return res.status(400).json({"error": "User already exists"})
        }
        user = new User({name, email, password, age});
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user:{
                "id" : user.id,
                "name": user.name,
                "email": user.email,
                "age": user.age,
            },
        }
        jwt.sign(payload, process.env.SECRET_KEY, {"expiresIn":3600}, (err, token) => {
            if (err) {
                throw err;
            }
            return res.status(201).json({"success": true, token: token});
        })
    }catch (error) {
        console.log(error);
        process.exit(1);
    }
})

module.exports = router;