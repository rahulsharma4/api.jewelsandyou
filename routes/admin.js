const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Contact = require('../models/Contact');
const { adminAuth } = require('../middleware/auth');

// Get all products (admin)
router.get('/products', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product
router.post('/products', adminAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('\n🔍 ADMIN PRODUCT CREATION');
    console.log('='.repeat(30));
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('Headers:', req.headers);
    
    const productData = req.body;
    if (req.file) {
      productData.image = req.file.filename;
      console.log('✅ Image uploaded:', req.file.filename);
    } else {
      console.log('⚠️ No image uploaded');
    }
    
    console.log('Product data:', productData);
    
    const product = new Product(productData);
    await product.save();
    
    console.log('✅ Product created successfully:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update product
router.put('/products/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('\n🔍 ADMIN PRODUCT UPDATE');
    console.log('='.repeat(30));
    console.log('ID:', req.params.id);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const productData = req.body;
    if (req.file) {
      // New image uploaded
      productData.image = req.file.filename;
      console.log('✅ New image uploaded:', req.file.filename);
    } else if (req.body.currentImage) {
      // Preserve existing image
      productData.image = req.body.currentImage;
      console.log('✅ Preserving existing image:', req.body.currentImage);
    } else {
      console.log('⚠️ No image provided - keeping existing image');
      // Don't update the image field
      delete productData.image;
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      { new: true }
    );
    
    if (!product) {
      console.log('❌ Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('✅ Product updated successfully:', product);
    res.json(product);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/products/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, trackingNumber },
      { new: true }
    ).populate('user', 'name email').populate('items.product');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      monthlyRevenue,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order analytics
router.get('/analytics/orders', adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('user', 'name email');
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    const dailyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      totalOrders: orders.length,
      statusCounts,
      dailyRevenue,
      period: days
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get advanced analytics
router.get('/analytics/advanced', adminAuth, async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const salesByCategory = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo' } },
      { $unwind: '$productInfo' },
      { $group: { _id: '$productInfo.category', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
    ]);

    const userStats = {
      total: await User.countDocuments(),
      active: await User.countDocuments({ status: 'active' }),
      suspended: await User.countDocuments({ status: 'suspended' })
    };

    const last7DaysSales = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$total" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalRevenue: totalSales[0]?.total || 0,
      salesByCategory,
      userStats,
      last7DaysSales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk Import Products (CSV)
router.post('/products/bulk-import', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fs = require('fs');
    const content = fs.readFileSync(req.file.path, 'utf8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const products = [];
    for (let i = 1; i < lines.length; i++) {
        const currentline = lines[i].split(',');
        if (currentline.length < headers.length) continue;
        
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j]?.trim();
        }
        
        // Basic validation
        if (obj.name && obj.price) {
            products.push({
                name: obj.name,
                price: parseFloat(obj.price),
                description: obj.description || '',
                category: obj.category || 'Uncategorized',
                stock: parseInt(obj.stock) || 0,
                featured: obj.featured === 'true'
            });
        }
    }

    if (products.length > 0) {
        await Product.insertMany(products);
    }

    // Cleanup file
    fs.unlinkSync(req.file.path);

    res.json({ message: `${products.length} products imported successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export Products (CSV)
router.get('/products/export', adminAuth, async (req, res) => {
  try {
    const products = await Product.find({});
    let csv = 'name,price,category,stock,featured,description\n';
    
    products.forEach(p => {
        csv += `${p.name},${p.price},${p.category},${p.stock},${p.featured},"${p.description.replace(/"/g, '""')}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status (Suspend/Activate)
router.put('/users/:id/status', adminAuth, async (req, res) => {
    try {
      const { status } = req.body;
      if (!['active', 'suspended'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
      }
      const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

// Get all contacts (admin)
router.get('/contacts', adminAuth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update contact status
router.put('/contacts/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;







