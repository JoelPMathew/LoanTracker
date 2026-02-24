const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Activity = require('../models/Activity');

// @route   GET api/activities
// @desc    Get user activities
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10);
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
