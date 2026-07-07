const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const listProducts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const products = await Product.find({});
    console.log(`\nFound ${products.length} products in DB:\n`);
    
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. Name: "${p.name}"`);
      console.log(`   Category: "${p.category}"`);
      console.log(`   Price: ₹${p.price}`);
      console.log(`   Stock: ${p.stock}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listProducts();
