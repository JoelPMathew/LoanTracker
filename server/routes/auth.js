const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, adminSecret } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Role Validation
        let assignedRole = 'BORROWER';
        if (role === 'ADMIN') {
            const secret = process.env.ADMIN_SECRET || 'admin123'; // Fallback for demo
            if (adminSecret !== secret) {
                return res.status(403).json({ message: 'Invalid Admin Secret Key' });
            }
            assignedRole = 'ADMIN';
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: assignedRole
        });

        await user.save();

        // Create token
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { password, role } = req.body;
        const email = req.body.email.toLowerCase();

        // Check if user exists
        let user = await User.findOne({ email });
        console.log(`Login attempt: ${email}, User found: ${!!user}`);

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Role Enforcement
        console.log(`Login Role Check: Target=${role}, UserRole=${user.role}`);
        if (role && user.role !== role) {
            console.log(`Role mismatch blocked for ${email}`);
            return res.status(401).json({
                message: `Unauthorized. This account is registered as a ${user.role}, but you are trying to log in as a ${role}.`
            });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match for ${email}: ${isMatch}`);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create token
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/user
// @desc    Get current user
// @access  Private
const auth = require('../middleware/auth');
router.get('/user', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/users
// @desc    Get all users (Admin only)
// @access  Private
router.get('/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
