const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const { json } = require("express");
const auth = require("../../middlewares/authMiddleware");

// @route POST api/register
// @description register
// @access Public
router.post(
    "/api/register",
    [
        check("fullName").not().isEmpty(),
        check("email", "Email is invalid").isEmail(),
        check("password", "password must in range 6-32 chars").isLength({
            min: 6,
            max: 32,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        const { fullName, email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ error: "User already exists" });
            }
            user = new User({ fullName, email, password });
            const salt = await bcrypt.genSalt(10);
            user.passwordHash = await bcrypt.hash(password, salt);
            await user.save();
            return res.status(201).json({
                success: true,
                message: "account is created successfully",
            });
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
);

// @route POST api/login
// @description login
// @access Public
router.post(
    "/api/login",
    [
        check("email", "Email is invalid").isEmail(),
        check("password", "password must in range 6-32 chars").isLength({
            min: 6,
            max: 32,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }
        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res
                    .status(400)
                    .json({ error: "Wrong email or password" });
            }
            const salt = await bcrypt.genSalt(10);
            const compared = await bcrypt.compare(password, user.passwordHash);
            if (!compared) {
                return res
                    .status(400)
                    .json({ error: "Wrong email or password" });
            }
            console.log(
                `[LOGIN SUCCESS] User: ${user.fullName} | Role: ${user.role} | Permissions: ${user.permissions}`
            );

            const payload = {
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                permission: user.permissions,
                id: user.id,
            };
            jwt.sign(
                payload,
                process.env.SECRET_KEY,
                { expiresIn: "15m" },
                (err, token) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    return res.status(200).json({ token: token });
                }
            );
        } catch (error) {
            console.log(error);
            process.exit(1);
        }
    }
);

// @route PUT api/user
// @description Update user info (address, phone number, etc.)
// @access Private
router.put(
    "/api/user",
    auth,
    [
        check("fullName")
            .optional()
            .not()
            .isEmpty()
            .withMessage("Full name cannot be empty"),
        check("address")
            .optional()
            .not()
            .isEmpty()
            .withMessage("Address cannot be empty"),
        check("phoneNumber")
            .optional()
            .matches(/^[0-9+\-\s()]{7,20}$/)
            .withMessage("Invalid phone number"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fullName, address, phoneNumber } = req.body;

        try {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ error: "User not found" });

            if (fullName !== undefined) user.fullName = fullName;
            if (address !== undefined) user.address = address;
            if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

            await user.save();
            res.json({
                success: true,
                message: "User info updated successfully",
                user: {
                    fullName: user.fullName,
                    email: user.email,
                    address: user.address,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error("Error updating user info:", error);
            res.status(500).json({ error: "Server error" });
        }
    }
);

module.exports = router;
