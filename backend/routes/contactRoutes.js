const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/contactController');

// GET route to test the endpoint
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Contact API is working' });
});

// POST route for sending emails
router.post('/', sendContactEmail);

module.exports = router; 