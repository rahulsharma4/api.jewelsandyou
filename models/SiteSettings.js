const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  hero: {
    title: { type: String, default: 'Exquisite Jewellery Collection' },
    subtitle: { type: String, default: 'Discover our handcrafted pieces of timeless beauty' },
    description: { type: String, default: 'From classic diamonds to contemporary designs, find your perfect piece that tells your unique story' },
    image: { type: String, default: null }
  },
  promotions: {
    bannerText: { type: String, default: 'Complimentary shipping on all orders over ₹49,999' },
    isActive: { type: Boolean, default: true }
  },
  contact: {
    email: { type: String, default: 'info@jewelsandyou.com' },
    phone: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: '123 Jewelry Lane, Diamond District, Mumbai' }
  },
  metalRates: {
    gold24k: { type: Number, default: 7200 },
    gold22k: { type: Number, default: 6600 },
    gold18k: { type: Number, default: 5400 },
    silver: { type: Number, default: 90 },
    platinum: { type: Number, default: 3500 }
  }
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
