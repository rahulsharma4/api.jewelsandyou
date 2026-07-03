require('dotenv').config();
const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const res = await db.collection('products').deleteMany({
      name: { $in: ['asfasf', 'rahul', 'wqrqr', 'test product'] }
    });
    console.log('Deleted count:', res.deletedCount);
  } finally {
    await client.close();
  }
}
run();
