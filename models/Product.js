const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  description: { type: String, required: true },
  category: { type: String, default: 'Uncategorized' },
  material: { type: String },
  color: { type: String },
  image: { type: String, default: 'placeholder.jpg' },
  images: [String],
  imageColors: [String],
  rating: { type: Number, default: 0 },
  reviews: [{
    user: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: Number,
    comment: String,
    images: [String],
    date: { type: Date, default: Date.now }
  }],
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  priceType: { type: String, enum: ['fixed', 'weight-based'], default: 'fixed' },
  weight: { type: Number, default: 0 },
  metalType: { type: String, enum: ['Gold 24K', 'Gold 22K', 'Gold 18K', 'Silver', 'Platinum', 'None'], default: 'None' },
  makingCharge: { type: Number, default: 0 },
  specifications: {
    material: String,
    stoneType: String,
    clarity: String,
    color: String,
    cut: String,
    weight: String,
    setting: String,
    certification: String
  }
}, { timestamps: true });

// Virtual field for formatted price in INR
productSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toLocaleString('en-IN')}`;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);







