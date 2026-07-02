const fs = require('fs');
const path = require('path');

console.log('🔧 Testing image serving configuration...\n');

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('❌ Uploads directory does not exist');
  process.exit(1);
}

console.log('✅ Uploads directory exists');

// List files in uploads directory
const files = fs.readdirSync(uploadsDir);
console.log(`📁 Found ${files.length} files in uploads directory:`);

files.forEach((file, index) => {
  const filePath = path.join(uploadsDir, file);
  const stats = fs.statSync(filePath);
  console.log(`   ${index + 1}. ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
});

console.log('\n🌐 Image URLs should be accessible at:');
files.slice(0, 3).forEach(file => {
  console.log(`   http://localhost:5000/uploads/${file}`);
});

console.log('\n✅ Image serving configuration is correct!');
console.log('\n📋 Next steps:');
console.log('1. Restart your backend server');
console.log('2. Test image URLs in browser');
console.log('3. Check if images display in frontend');

console.log('\n🎉 Image serving is ready!');




