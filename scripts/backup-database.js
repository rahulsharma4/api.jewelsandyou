const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

// Database backup script
async function backupDatabase() {
  try {
    console.log('💾 Starting database backup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelsnyou', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups', timestamp);
    
    // Create backup directory
    if (!fs.existsSync(path.join(__dirname, '..', 'backups'))) {
      fs.mkdirSync(path.join(__dirname, '..', 'backups'));
    }
    fs.mkdirSync(backupDir);

    // Collections to backup
    const collections = ['users', 'products', 'orders'];
    
    for (const collectionName of collections) {
      console.log(`📦 Backing up ${collectionName}...`);
      
      const collection = db.collection(collectionName);
      const documents = await collection.find({}).toArray();
      
      const backupFile = path.join(backupDir, `${collectionName}.json`);
      fs.writeFileSync(backupFile, JSON.stringify(documents, null, 2));
      
      console.log(`✅ ${collectionName}: ${documents.length} documents backed up`);
    }

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: collections.map(name => ({
        name,
        count: fs.readFileSync(path.join(backupDir, `${name}.json`), 'utf8').split('\n').length - 1
      })),
      version: '1.0.0'
    };

    fs.writeFileSync(
      path.join(backupDir, 'metadata.json'), 
      JSON.stringify(metadata, null, 2)
    );

    console.log(`\n✅ Backup completed successfully!`);
    console.log(`📁 Backup location: ${backupDir}`);
    console.log(`📊 Collections backed up: ${collections.length}`);
    
    // Clean up old backups (keep last 10)
    const backupsDir = path.join(__dirname, '..', 'backups');
    const backupFolders = fs.readdirSync(backupsDir)
      .filter(folder => fs.statSync(path.join(backupsDir, folder)).isDirectory())
      .sort()
      .reverse();

    if (backupFolders.length > 10) {
      const foldersToDelete = backupFolders.slice(10);
      for (const folder of foldersToDelete) {
        const folderPath = path.join(backupsDir, folder);
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`🗑️  Deleted old backup: ${folder}`);
      }
    }

  } catch (error) {
    console.error('❌ Error backing up database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Restore database from backup
async function restoreDatabase(backupPath) {
  try {
    console.log(`🔄 Starting database restore from ${backupPath}...`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jewelsnyou', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Read metadata
    const metadataPath = path.join(backupPath, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error('Metadata file not found in backup directory');
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    console.log(`📅 Backup date: ${metadata.timestamp}`);
    
    // Restore collections
    const collections = ['users', 'products', 'orders'];
    
    for (const collectionName of collections) {
      console.log(`📦 Restoring ${collectionName}...`);
      
      const backupFile = path.join(backupPath, `${collectionName}.json`);
      if (!fs.existsSync(backupFile)) {
        console.log(`⚠️  Skipping ${collectionName} - file not found`);
        continue;
      }
      
      const documents = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
      const collection = db.collection(collectionName);
      
      // Clear existing data
      await collection.deleteMany({});
      
      // Insert backup data
      if (documents.length > 0) {
        await collection.insertMany(documents);
      }
      
      console.log(`✅ ${collectionName}: ${documents.length} documents restored`);
    }

    console.log('\n✅ Database restore completed successfully!');
    
  } catch (error) {
    console.error('❌ Error restoring database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run backup if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args[0] === 'restore' && args[1]) {
    restoreDatabase(args[1]);
  } else {
    backupDatabase();
  }
}

module.exports = { backupDatabase, restoreDatabase };




