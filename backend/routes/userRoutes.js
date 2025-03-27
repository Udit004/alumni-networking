const express = require('express');
const User = require('../models/user');
const router = express.Router();

// Get user by Firebase UID
router.get('/firebase/:firebaseUID', async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUID: req.params.firebaseUID });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { firebaseUID, name, email, role } = req.body;

        // Validate required fields
        if (!firebaseUID || !name || !email || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ firebaseUID }, { email }] 
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            firebaseUID,
            name,
            email,
            role
        });

        await user.save();
        console.log('✅ User created successfully:', user);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
