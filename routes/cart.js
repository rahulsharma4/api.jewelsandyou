const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const Product = require('../models/Product');
const { applyDynamicPrices } = require('../utils/priceCalculator');

// Get user cart
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (user && user.cart) {
      const products = user.cart.map(item => item.product).filter(Boolean);
      await applyDynamicPrices(products);
      
      // Update cart item price dynamically too so that checkout calculations are in sync
      user.cart.forEach(item => {
        if (item.product) {
          item.price = item.product.price;
        }
      });
    }
    res.json(user.cart || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const user = await User.findById(req.user.id);
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if item already in cart
    const existingItem = user.cart.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({
        product: productId,
        quantity,
        price: product.price
      });
    }
    
    await user.save();
    await user.populate('cart.product');
    
    if (user.cart) {
      const products = user.cart.map(item => item.product).filter(Boolean);
      await applyDynamicPrices(products);
      user.cart.forEach(item => {
        if (item.product) {
          item.price = item.product.price;
        }
      });
    }
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update cart item quantity
router.put('/update/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = await User.findById(req.user.id);
    
    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      user.cart = user.cart.filter(item => item.product.toString() !== productId);
    } else {
      cartItem.quantity = quantity;
    }
    
    await user.save();
    await user.populate('cart.product');
    
    if (user.cart) {
      const products = user.cart.map(item => item.product).filter(Boolean);
      await applyDynamicPrices(products);
      user.cart.forEach(item => {
        if (item.product) {
          item.price = item.product.price;
        }
      });
    }
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    
    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();
    await user.populate('cart.product');
    
    if (user.cart) {
      const products = user.cart.map(item => item.product).filter(Boolean);
      await applyDynamicPrices(products);
      user.cart.forEach(item => {
        if (item.product) {
          item.price = item.product.price;
        }
      });
    }
    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

