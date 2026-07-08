const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'subscribed';
        await existing.save();
        return res.json({ message: 'Resubscribed successfully!' });
      }
      return res.status(400).json({ message: 'You are already subscribed!' });
    }

    const subscriber = new Newsletter({ email });
    await subscriber.save();
    
    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;
