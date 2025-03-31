const express = require('express');
const router = express.Router();

// Basic auth routes
router.post('/login', (req, res) => {
    res.json({ message: 'Login route' });
});

router.post('/register', (req, res) => {
    res.json({ message: 'Register route' });
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logout route' });
});

module.exports = router; 