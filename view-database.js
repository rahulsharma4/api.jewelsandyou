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

async function viewDatabase() {
  try {
    console.log('\n📊 DATABASE OVERVIEW');
    console.log('='.repeat(50));
    
    // Count documents in each collection
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`👥 Users: ${userCount}`);
    console.log(`🛍️  Products: ${productCount}`);
    console.log(`📦 Orders: ${orderCount}`);
    
    // Show recent users
    console.log('\n👥 RECENT USERS');
    console.log('-'.repeat(30));
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    recentUsers.forEach(user => {
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('---');
    });
    
    // Show products
    console.log('\n🛍️  PRODUCTS');
    console.log('-'.repeat(30));
    const products = await Product.find()
      .select('name price category stock')
      .limit(10);
    
    products.forEach(product => {
      console.log(`Name: ${product.name}`);
      console.log(`Price: ₹${product.price}`);
      console.log(`Category: ${product.category}`);
      console.log(`Stock: ${product.stock}`);
      console.log('---');
    });
    
    // Show recent orders
    console.log('\n📦 RECENT ORDERS');
    console.log('-'.repeat(30));
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    recentOrders.forEach(order => {
      console.log(`Order ID: ${order._id}`);
      console.log(`User: ${order.user.name} (${order.user.email})`);
      console.log(`Total: ₹${order.total}`);
      console.log(`Status: ${order.status}`);
      console.log(`Date: ${order.createdAt.toLocaleDateString()}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error viewing database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the function
viewDatabase();

