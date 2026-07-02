const mongoose = require('mongoose');

const fallbackUri = 'mongodb://rahulbhardwaz2k1_db_user:FAgXrdxlgtaGL7pG@ac-ly12wfd-shard-00-00.cg5x832.mongodb.net:27017,ac-ly12wfd-shard-00-01.cg5x832.mongodb.net:27017,ac-ly12wfd-shard-00-02.cg5x832.mongodb.net:27017/jewelsnyou?ssl=true&replicaSet=atlas-2q5v6w-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  try {
    await mongoose.connect(fallbackUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas successfully using FALLBACK string');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
