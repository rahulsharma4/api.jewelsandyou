const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const testSearch = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');

    const query = 'ring';
    let searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    };

    console.log('Search Query:', JSON.stringify(searchQuery));
    const results = await Product.find(searchQuery);
    console.log(`Found ${results.length} matches for "ring":`);
    results.forEach(p => console.log(`- ${p.name} (${p.category})`));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testSearch();
