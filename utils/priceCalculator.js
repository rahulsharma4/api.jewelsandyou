const mongoose = require('mongoose');

let cachedRates = null;
let cacheTime = 0;

async function getMetalRates() {
  const now = Date.now();
  if (cachedRates && (now - cacheTime < 30000)) { // 30 seconds cache
    return cachedRates;
  }
  try {
    const SiteSettings = mongoose.model('SiteSettings');
    const settings = await SiteSettings.findOne();
    if (settings && settings.metalRates) {
      cachedRates = settings.metalRates;
    } else {
      cachedRates = { gold24k: 7200, gold22k: 6600, gold18k: 5400, silver: 90, platinum: 3500 };
    }
  } catch (e) {
    cachedRates = { gold24k: 7200, gold22k: 6600, gold18k: 5400, silver: 90, platinum: 3500 };
  }
  cacheTime = now;
  return cachedRates;
}

function getRateForMetal(metalType, rates) {
  switch (metalType) {
    case 'Gold 24K': return rates.gold24k;
    case 'Gold 22K': return rates.gold22k;
    case 'Gold 18K': return rates.gold18k;
    case 'Silver': return rates.silver;
    case 'Platinum': return rates.platinum;
    default: return 0;
  }
}

async function calculateProductPrice(product) {
  if (product.priceType !== 'weight-based') {
    return product.price;
  }
  const rates = await getMetalRates();
  const metalRate = getRateForMetal(product.metalType, rates);
  const calculated = (product.weight * metalRate) + (product.makingCharge || 0);
  return Math.round(calculated);
}

async function applyDynamicPrices(products) {
  if (!products) return products;
  const isArray = Array.isArray(products);
  const items = isArray ? products : [products];
  const rates = await getMetalRates();

  for (const item of items) {
    if (item && item.priceType === 'weight-based') {
      const metalRate = getRateForMetal(item.metalType, rates);
      const calculatedPrice = (item.weight * metalRate) + (item.makingCharge || 0);
      item.price = Math.round(calculatedPrice);
    }
  }
  return products;
}

module.exports = {
  getMetalRates,
  calculateProductPrice,
  applyDynamicPrices
};
