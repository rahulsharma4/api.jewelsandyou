const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { auth, adminAuth } = require('../middleware/auth');

// Apply coupon (Public/Authenticated)
router.post('/apply', async (req, res) => {
  try {
    const { code, purchaseAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    if (purchaseAmount < coupon.minPurchase) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum purchase amount of ₹${coupon.minPurchase} required` 
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (purchaseAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      discountAmount,
      couponId: coupon._id,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Coupon apply error:', error);
    res.status(500).json({ success: false, message: 'Failed to apply coupon' });
  }
});

// Create coupon (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all coupons (Admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete coupon
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
