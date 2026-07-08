const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed'],
    default: 'subscribed'
  }
}, { timestamps: true });

module.exports = mongoose.model('Newsletter', newsletterSchema);
