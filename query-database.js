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

async function queryDatabase() {
  try {
    console.log('\n🔍 DATABASE QUERY TOOL');
    console.log('='.repeat(50));
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch(command) {
      case 'users':
        await showUsers();
        break;
      case 'products':
        await showProducts();
        break;
      case 'orders':
        await showOrders();
        break;
      case 'user':
        const userId = args[1];
        if (userId) {
          await showUserById(userId);
        } else {
          console.log('❌ Please provide a user ID');
        }
        break;
      case 'product':
        const productId = args[1];
        if (productId) {
          await showProductById(productId);
        } else {
          console.log('❌ Please provide a product ID');
        }
        break;
      case 'order':
        const orderId = args[1];
        if (orderId) {
          await showOrderById(orderId);
        } else {
          console.log('❌ Please provide an order ID');
        }
        break;
      default:
        showHelp();
    }
    
  } catch (error) {
    console.error('Error querying database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

async function showUsers() {
  console.log('\n👥 ALL USERS');
  console.log('-'.repeat(40));
  const users = await User.find().select('name email role createdAt');
  users.forEach(user => {
    console.log(`ID: ${user._id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Created: ${user.createdAt.toLocaleDateString()}`);
    console.log('---');
  });
}

async function showProducts() {
  console.log('\n🛍️  ALL PRODUCTS');
  console.log('-'.repeat(40));
  const products = await Product.find().select('name price category stock featured');
  products.forEach(product => {
    console.log(`ID: ${product._id}`);
    console.log(`Name: ${product.name}`);
    console.log(`Price: ₹${product.price}`);
    console.log(`Category: ${product.category}`);
    console.log(`Stock: ${product.stock}`);
    console.log(`Featured: ${product.featured ? 'Yes' : 'No'}`);
    console.log('---');
  });
}

async function showOrders() {
  console.log('\n📦 ALL ORDERS');
  console.log('-'.repeat(40));
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name');
  
  orders.forEach(order => {
    console.log(`ID: ${order._id}`);
    console.log(`User: ${order.user.name} (${order.user.email})`);
    console.log(`Total: ₹${order.total}`);
    console.log(`Status: ${order.status}`);
    console.log(`Items: ${order.items.length}`);
    console.log(`Date: ${order.createdAt.toLocaleDateString()}`);
    console.log('---');
  });
}

async function showUserById(userId) {
  console.log(`\n👤 USER DETAILS: ${userId}`);
  console.log('-'.repeat(40));
  const user = await User.findById(userId);
  if (user) {
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Email Verified: ${user.emailVerified}`);
    console.log(`Status: ${user.status}`);
    console.log(`Created: ${user.createdAt.toLocaleDateString()}`);
    console.log(`Cart Items: ${user.cart.length}`);
    console.log(`Favorites: ${user.favorites.length}`);
    console.log(`Addresses: ${user.addresses.length}`);
  } else {
    console.log('❌ User not found');
  }
}

async function showProductById(productId) {
  console.log(`\n🛍️  PRODUCT DETAILS: ${productId}`);
  console.log('-'.repeat(40));
  const product = await Product.findById(productId);
  if (product) {
    console.log(`Name: ${product.name}`);
    console.log(`Price: ₹${product.price}`);
    console.log(`Category: ${product.category}`);
    console.log(`Stock: ${product.stock}`);
    console.log(`Featured: ${product.featured ? 'Yes' : 'No'}`);
    console.log(`Rating: ${product.rating}`);
    console.log(`Reviews: ${product.reviews.length}`);
    console.log(`Description: ${product.description}`);
    if (product.specifications) {
      console.log('Specifications:');
      Object.entries(product.specifications).forEach(([key, value]) => {
        if (value) console.log(`  ${key}: ${value}`);
      });
    }
  } else {
    console.log('❌ Product not found');
  }
}

async function showOrderById(orderId) {
  console.log(`\n📦 ORDER DETAILS: ${orderId}`);
  console.log('-'.repeat(40));
  const order = await Order.findById(orderId)
    .populate('user', 'name email')
    .populate('items.product', 'name price');
  
  if (order) {
    console.log(`User: ${order.user.name} (${order.user.email})`);
    console.log(`Total: ₹${order.total}`);
    console.log(`Status: ${order.status}`);
    console.log(`Payment Method: ${order.paymentMethod}`);
    console.log(`Shipping Method: ${order.shippingMethod}`);
    console.log(`Shipping Cost: ₹${order.shippingCost}`);
    console.log(`Date: ${order.createdAt.toLocaleDateString()}`);
    console.log('\nItems:');
    order.items.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.product.name} - Qty: ${item.quantity} - Price: ₹${item.price}`);
    });
    if (order.shippingAddress) {
      console.log('\nShipping Address:');
      console.log(`  Name: ${order.shippingAddress.name}`);
      console.log(`  Address: ${order.shippingAddress.address}`);
      console.log(`  City: ${order.shippingAddress.city}`);
      console.log(`  Country: ${order.shippingAddress.country}`);
      console.log(`  ZIP: ${order.shippingAddress.zip}`);
    }
  } else {
    console.log('❌ Order not found');
  }
}

function showHelp() {
  console.log('\n📖 DATABASE QUERY COMMANDS');
  console.log('='.repeat(50));
  console.log('node query-database.js users          - Show all users');
  console.log('node query-database.js products       - Show all products');
  console.log('node query-database.js orders        - Show all orders');
  console.log('node query-database.js user <id>     - Show specific user');
  console.log('node query-database.js product <id>  - Show specific product');
  console.log('node query-database.js order <id>    - Show specific order');
  console.log('\nExamples:');
  console.log('node query-database.js user 68d5644f1bab05e1756aaa4e');
  console.log('node query-database.js product 68d5644f1bab05e1756aaa4f');
}

// Run the function
queryDatabase();

