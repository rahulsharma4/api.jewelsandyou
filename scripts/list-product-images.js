require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const listImages = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const products = await Product.find({}, 'name image images');
    console.log(`\nFound ${products.length} products in DB:\n`);
    
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. Name: "${p.name}"`);
      console.log(`   image:  "${p.image}"`);
      console.log(`   images: ${JSON.stringify(p.images)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listImages();
