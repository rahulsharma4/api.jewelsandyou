const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const fixUserRoles = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Find users with invalid roles
    const users = await User.find({});
    console.log(`Checking ${users.length} users...`);

    let updatedCount = 0;
    for (const u of users) {
      if (u.role !== 'user' && u.role !== 'admin') {
        console.log(`Fixing user: ${u.email} (Role was: "${u.role}")`);
        u.role = u.email === 'admin@jewelsnyou.com' ? 'admin' : 'user';
        await u.save();
        updatedCount++;
      }
    }

    console.log(`\nMigration completed. Fixed ${updatedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

fixUserRoles();
