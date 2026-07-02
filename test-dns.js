const dns = require('dns');
// Override DNS to use Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const uri = 'mongodb+srv://rahulbhardwaz2k1_db_user:FAgXrdxlgtaGL7pG@cluster0.cg5x832.mongodb.net/jewelsnyou?appName=Cluster0';

async function testConnection() {
  console.log('Attempting to connect with Google DNS override...');
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas successfully using SRV string WITH Google DNS!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
