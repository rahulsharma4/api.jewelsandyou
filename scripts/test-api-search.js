const http = require('http');

const testApi = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', err => reject(err));
  });
};

const run = async () => {
  try {
    console.log('Querying search API with category=All...');
    const res1 = await testApi('http://localhost:5000/api/products/search/ring?category=All');
    console.log(`Results (category=All): ${res1.products ? res1.products.length : 0} items`);
    if (res1.products) {
      res1.products.forEach(p => console.log(`- ${p.name} (${p.category})`));
    }

    console.log('\nQuerying search API with category=loha...');
    const res2 = await testApi('http://localhost:5000/api/products/search/ring?category=loha');
    console.log(`Results (category=loha): ${res2.products ? res2.products.length : 0} items`);
    if (res2.products) {
      res2.products.forEach(p => console.log(`- ${p.name} (${p.category})`));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
