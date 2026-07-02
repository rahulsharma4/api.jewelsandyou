const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing image upload functionality...\n');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ Uploads directory already exists');
}

// Create a sample image for testing
const sampleImagePath = path.join(uploadsDir, 'sample.jpg');
if (!fs.existsSync(sampleImagePath)) {
  // Create a simple placeholder file
  fs.writeFileSync(sampleImagePath, '');
  console.log('✅ Created sample image file');
}

console.log('\n📁 Uploads directory structure:');
console.log(`📂 ${uploadsDir}`);
console.log('   ├── sample.jpg (placeholder)');
console.log('   └── (uploaded images will appear here)');

console.log('\n🎉 Image upload functionality is now ready!');
console.log('\n📋 Next steps:');
console.log('1. Restart your backend server');
console.log('2. Test image upload in admin panel');
console.log('3. Images will be saved to: backend/uploads/');




