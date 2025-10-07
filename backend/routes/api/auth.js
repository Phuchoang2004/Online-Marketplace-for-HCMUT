const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const auth = require('../../middlewares/authMiddleware')
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const {check, validationResult} = require("express-validator")
const {json} = require("express");

// @route GET api/auth
// @description test route auth
// @access Public
router.get('/', async (req, res) => {
    console.log(req.user)
    try {
        const user = await (User.findById(req.user.id)).select("-password")
        res.json(user)
    }catch(err){
        return res.status(500).json({"error": err.message})
    }
});

// @route POST api/auth
// @description login
// @access Public
router.post('/',[
    check('email','email is invalid').isEmail(),
    check('password', 'password in range 6 to 32').isLength({ min: 6, max: 32 }),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({"error": errors.array()})
    }
    const { email, password } = req.body;
    try{
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({"error": "User not found"})
        }
        const compared = await bcrypt.compare(password, user.password)
        if(!compared){
            return res.status(400).json({"error": "wrong password"})
        }
        const payload = {
                id : user.id,
                email : user.email,
                age : user.age

        }
        jwt.sign(payload, process.env.SECRET_KEY,{expiresIn: 3600}, (err, token) => {
            if(err){
                return res.status(400).json({"error": err.message})
            }
            return res.status(200).json({"token": token})
        })
    }catch(err){
        return res.status(400).json({"error": err.message})
    }
})

module.exports = router;
