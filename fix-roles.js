require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const fixRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);

    for (let user of users) {
      console.log(`- ${user.email} (Current Role: ${user.role})`);
      if (user.email === 'admin@jewelsnyou.com') {
        user.role = 'admin';
        await user.save();
        console.log(`  -> Restored Admin role for ${user.email}`);
      }
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixRoles();
