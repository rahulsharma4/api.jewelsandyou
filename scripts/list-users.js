const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const listUsers = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const users = await User.find({}, 'name email role status');
    console.log(`\nFound ${users.length} users in DB:\n`);
    
    users.forEach((u, idx) => {
      console.log(`${idx + 1}. Name: "${u.name}"`);
      console.log(`   Email:  "${u.email}"`);
      console.log(`   Role:   "${u.role}"`);
      console.log(`   Status: "${u.status}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listUsers();
