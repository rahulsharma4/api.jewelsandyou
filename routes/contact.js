const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// @route   POST /api/contact
// @desc    Submit a contact message
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });
    
    await newContact.save();
    
    res.status(201).json({ message: 'Message sent successfully', contact: newContact });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
