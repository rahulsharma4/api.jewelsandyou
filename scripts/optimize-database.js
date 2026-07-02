const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

// Database optimization script
async function optimizeDatabase() {
  try {
    console.log('🔧 Starting database optimization...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelsnyou', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Create indexes for better performance
    console.log('📊 Creating database indexes...');

    // User collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ resetPasswordToken: 1 });
    await db.collection('users').createIndex({ emailVerificationToken: 1 });
    console.log('✅ User indexes created');

    // Product collection indexes
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ price: 1 });
    await db.collection('products').createIndex({ rating: -1 });
    await db.collection('products').createIndex({ featured: 1 });
    await db.collection('products').createIndex({ stock: 1 });
    await db.collection('products').createIndex({ createdAt: -1 });
    console.log('✅ Product indexes created');

    // Order collection indexes
    await db.collection('orders').createIndex({ user: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ 'items.product': 1 });
    await db.collection('orders').createIndex({ total: 1 });
    console.log('✅ Order indexes created');

    // Create compound indexes for common queries
    await db.collection('products').createIndex({ category: 1, price: 1 });
    await db.collection('products').createIndex({ category: 1, featured: 1 });
    await db.collection('orders').createIndex({ user: 1, status: 1 });
    await db.collection('orders').createIndex({ status: 1, createdAt: -1 });
    console.log('✅ Compound indexes created');

    // Get collection statistics
    console.log('\n📈 Collection Statistics:');
    
    const userStats = await db.collection('users').stats();
    const productStats = await db.collection('products').stats();
    const orderStats = await db.collection('orders').stats();

    console.log(`Users: ${userStats.count} documents, ${userStats.size} bytes`);
    console.log(`Products: ${productStats.count} documents, ${productStats.size} bytes`);
    console.log(`Orders: ${orderStats.count} documents, ${orderStats.size} bytes`);

    // Get index information
    console.log('\n🔍 Index Information:');
    
    const userIndexes = await db.collection('users').listIndexes().toArray();
    const productIndexes = await db.collection('products').listIndexes().toArray();
    const orderIndexes = await db.collection('orders').listIndexes().toArray();

    console.log(`Users: ${userIndexes.length} indexes`);
    console.log(`Products: ${productIndexes.length} indexes`);
    console.log(`Orders: ${orderIndexes.length} indexes`);

    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    console.log('1. Monitor slow queries using MongoDB profiler');
    console.log('2. Consider sharding for large datasets');
    console.log('3. Implement connection pooling');
    console.log('4. Use read preferences for read-heavy operations');
    console.log('5. Consider using MongoDB Atlas for production');

    console.log('\n✅ Database optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error optimizing database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeDatabase();
}

module.exports = optimizeDatabase;




