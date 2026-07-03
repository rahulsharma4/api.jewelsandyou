require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SiteSettings = require('../models/SiteSettings');

const setupDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully to MongoDB Atlas.');

    console.log('Wiping database collections...');
    
    // Clear all existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    if (SiteSettings) {
      await SiteSettings.deleteMany({});
    }
    
    console.log('✅ Database wiped successfully.');

    // Seed Admin User (plain password — User model pre-save hook handles hashing)
    console.log('Seeding Admin user...');

    const admin = new User({
      name: 'Admin',
      email: 'admin@jewelsnyou.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890'
    });

    await admin.save();
    console.log('✅ Admin user created successfully:');
    console.log('   Email: admin@jewelsnyou.com');
    console.log('   Password: admin123');

    // Seed default Site Settings
    if (SiteSettings) {
      const defaultSettings = new SiteSettings({
        hero: {
          title: "Exquisite Jewellery Collection",
          subtitle: "Discover our handcrafted pieces of timeless beauty",
          description: "From classic diamonds to contemporary designs, find your perfect piece that tells your unique story"
        },
        promotions: {
          bannerText: "Complimentary shipping on all orders over ₹49,999",
          isActive: true
        }
      });
      await defaultSettings.save();
      console.log('✅ Default site settings created.');
    }

    console.log('Database setup complete! You can now exit.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
