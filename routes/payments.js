const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const stripeService = require('../services/stripeService');
const User = require('../models/User');
const Order = require('../models/Order');

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId, items } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid amount' 
      });
    }

    const metadata = {
      orderId: orderId || 'unknown',
      userId: req.user.id,
      items: JSON.stringify(items || [])
    };

    const result = await stripeService.createPaymentIntent(amount, currency, metadata);
    
    if (result.success) {
      res.json({
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
        amount: result.amount,
        currency: result.currency
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment processing failed' 
    });
  }
});

// Confirm payment
router.post('/confirm-payment', auth, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment intent ID required' 
      });
    }

    const result = await stripeService.confirmPaymentIntent(paymentIntentId);
    
    if (result.success) {
      res.json({
        success: true,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        paymentIntent: result.paymentIntent
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment confirmation failed' 
    });
  }
});

// Create customer
router.post('/create-customer', auth, async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and name required' 
      });
    }

    const result = await stripeService.createCustomer(email, name, {
      userId: req.user.id
    });
    
    if (result.success) {
      // Save customer ID to user profile
      await User.findByIdAndUpdate(req.user.id, {
        stripeCustomerId: result.customerId
      });

      res.json({
        success: true,
        customerId: result.customerId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Customer creation failed' 
    });
  }
});

// Get customer payment methods
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.json({
        success: true,
        paymentMethods: []
      });
    }

    const result = await stripeService.getCustomerPaymentMethods(user.stripeCustomerId);
    
    if (result.success) {
      res.json({
        success: true,
        paymentMethods: result.paymentMethods
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve payment methods' 
    });
  }
});

// Create setup intent for saving payment methods
router.post('/setup-intent', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({ 
        success: false,
        message: 'Customer not found. Please create a customer first.' 
      });
    }

    const result = await stripeService.createSetupIntent(user.stripeCustomerId);
    
    if (result.success) {
      res.json({
        success: true,
        clientSecret: result.clientSecret,
        setupIntentId: result.setupIntentId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Setup intent creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Setup intent creation failed' 
    });
  }
});

// Create refund
router.post('/refund', auth, async (req, res) => {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment intent ID required' 
      });
    }

    const result = await stripeService.createRefund(paymentIntentId, amount, reason);
    
    if (result.success) {
      res.json({
        success: true,
        refundId: result.refundId,
        amount: result.amount,
        status: result.status
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Refund creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Refund creation failed' 
    });
  }
});

// Get payment intent details
router.get('/payment-intent/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await stripeService.getPaymentIntent(id);
    
    if (result.success) {
      res.json({
        success: true,
        paymentIntent: result.paymentIntent,
        status: result.status,
        amount: result.amount,
        currency: result.currency
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get payment intent error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve payment intent' 
    });
  }
});

// Get account balance (admin only)
router.get('/balance', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    const result = await stripeService.getAccountBalance();
    
    if (result.success) {
      res.json({
        success: true,
        balance: result.balance,
        available: result.available,
        pending: result.pending
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve balance' 
    });
  }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    
    try {
      event = stripeService.verifyWebhookSignature(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const Order = require('../models/Order');
    
    // Handle the event
    switch (event.event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.event.data.object;
        console.log('💰 Payment succeeded:', paymentIntent.id);
        
        // Update order status in database using paymentIntentId
        await Order.findOneAndUpdate(
          { 'paymentInfo.paymentIntentId': paymentIntent.id },
          { 
            'paymentInfo.status': 'succeeded',
            status: 'processing' // Match the enum in Order.js (lower case)
          }
        );
        break;
      case 'payment_intent.payment_failed':
        const failedIntent = event.event.data.object;
        console.log('❌ Payment failed:', failedIntent.id);
        
        await Order.findOneAndUpdate(
          { 'paymentInfo.paymentIntentId': failedIntent.id },
          { 'paymentInfo.status': 'failed' }
        );
        break;
      default:
        console.log(`Unhandled event type ${event.event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Webhook processing failed' 
    });
  }
});

module.exports = router;

