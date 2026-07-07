const http = require('http');

http.get('http://localhost:5000/api/products/categories/list', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Categories Response:', data);
    process.exit(0);
  });
}).on('error', (err) => {
  console.error(err);
  process.exit(1);
});
