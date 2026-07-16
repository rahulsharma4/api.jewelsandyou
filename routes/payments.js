const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const razorpayService = require('../services/razorpayService');
const User = require('../models/User');
const Order = require('../models/Order');

// Create payment order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount' 
      });
    }

    const result = await razorpayService.createOrder(amount, currency, receipt);
    
    if (result.success) {
      res.json({
        success: true,
        order: result.order,
        key: process.env.RAZORPAY_KEY_ID
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Order creation failed' 
    });
  }
});

// Verify payment signature
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        message: 'Incomplete payment details' 
      });
    }

    const verification = razorpayService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    
    if (verification.success) {
      // Update order status in database if orderId is provided
      if (orderId) {
        await Order.findByIdAndUpdate(
          orderId,
          { 
            'paymentInfo.status': 'succeeded',
            'paymentInfo.paymentIntentId': razorpay_payment_id,
            'paymentInfo.razorpayOrderId': razorpay_order_id,
            'paymentInfo.razorpaySignature': razorpay_signature,
            'paymentInfo.method': 'razorpay',
            status: 'processing'
          }
        );
      }

      res.json({
        success: true,
        message: 'Payment verified successfully'
      });
    } else {
      // Payment failed signature verification
      if (orderId) {
        await Order.findByIdAndUpdate(
          orderId,
          { 'paymentInfo.status': 'failed' }
        );
      }
      res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment verification failed' 
    });
  }
});

module.exports = router;
