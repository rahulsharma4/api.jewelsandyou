const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentInfo, shippingMethod } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(400).json({ message: 'Product not found' });
      subtotal += product.price * item.quantity;
    }
    
    const shippingCost = shippingMethod === 'express' ? 15 : 0;
    const total = subtotal + shippingCost;
    
    const order = new Order({
      user: req.user.id,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress,
      paymentMethod,
      paymentInfo,
      shippingMethod,
      shippingCost,
      subtotal,
      total
    });
    
    await order.save();
    await order.populate('items.product');
    
    // Get user details for email
    const user = await User.findById(req.user.id);
    
    // Send order confirmation email
    try {
      await emailService.sendOrderConfirmation(user.email, user.name, order);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order if email fails
    }
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, trackingNumber },
      { new: true }
    ).populate('user', 'name email').populate('items.product');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Send shipping notification if status is 'shipped'
    if (status === 'shipped' && trackingNumber) {
      try {
        await emailService.sendShippingNotification(
          order.user.email, 
          order.user.name, 
          order, 
          trackingNumber
        );
      } catch (emailError) {
        console.error('Error sending shipping notification:', emailError);
      }
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order tracking info
router.get('/:id/tracking', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const trackingInfo = {
      orderId: order._id,
      status: order.status,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingMethod: order.shippingMethod,
      shippingAddress: order.shippingAddress
    };
    
    res.json(trackingInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;







