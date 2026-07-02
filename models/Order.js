const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  shippingAddress: {
    name: String,
    address: String,
    city: String,
    country: String,
    zip: String
  },
  paymentMethod: { type: String, required: true },
  paymentInfo: {
    paymentIntentId: String,
    status: String,
    method: { type: String, default: 'card' }
  },
  shippingMethod: { type: String, required: true },
  shippingCost: { type: Number, default: 0 },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  trackingNumber: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);











