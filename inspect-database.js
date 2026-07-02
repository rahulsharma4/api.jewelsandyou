const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelsnyou', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

async function inspectDatabase() {
  try {
    console.log('\n🔍 DETAILED DATABASE INSPECTION');
    console.log('='.repeat(60));
    
    // Database stats
    console.log(`📊 Database: jewelsnyou`);
    console.log(`📁 Collections: users, products, orders`);
    
    // User analysis
    console.log('\n👥 USER ANALYSIS');
    console.log('-'.repeat(40));
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const verifiedUsers = await User.countDocuments({ emailVerified: true });
    
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admin Users: ${adminUsers}`);
    console.log(`Regular Users: ${regularUsers}`);
    console.log(`Verified Users: ${verifiedUsers}`);
    
    // Product analysis
    console.log('\n🛍️  PRODUCT ANALYSIS');
    console.log('-'.repeat(40));
    const totalProducts = await Product.countDocuments();
    const inStockProducts = await Product.countDocuments({ stock: { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const featuredProducts = await Product.countDocuments({ featured: true });
    
    console.log(`Total Products: ${totalProducts}`);
    console.log(`In Stock: ${inStockProducts}`);
    console.log(`Out of Stock: ${outOfStockProducts}`);
    console.log(`Featured Products: ${featuredProducts}`);
    
    // Category breakdown
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📂 Categories:');
    categories.forEach(cat => {
      console.log(`  ${cat._id}: ${cat.count} products`);
    });
    
    // Order analysis
    console.log('\n📦 ORDER ANALYSIS');
    console.log('-'.repeat(40));
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Pending: ${pendingOrders}`);
    console.log(`Processing: ${processingOrders}`);
    console.log(`Shipped: ${shippedOrders}`);
    console.log(`Delivered: ${deliveredOrders}`);
    
    // Revenue analysis
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrderValue: { $avg: '$total' } } }
    ]);
    
    if (revenueData.length > 0) {
      console.log(`\n💰 REVENUE ANALYSIS`);
      console.log('-'.repeat(40));
      console.log(`Total Revenue: ₹${revenueData[0].totalRevenue.toLocaleString()}`);
      console.log(`Average Order Value: ₹${revenueData[0].avgOrderValue.toFixed(2)}`);
    }
    
    // Recent activity
    console.log('\n🕒 RECENT ACTIVITY');
    console.log('-'.repeat(40));
    const recentUsers = await User.find()
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log('Latest Users:');
    recentUsers.forEach(user => {
      console.log(`  ${user.name} (${user.email}) - ${user.createdAt.toLocaleDateString()}`);
    });
    
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(3);
    
    console.log('\nLatest Orders:');
    recentOrders.forEach(order => {
      console.log(`  Order by ${order.user.name} - ₹${order.total} - ${order.status} - ${order.createdAt.toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('Error inspecting database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the function
inspectDatabase();
