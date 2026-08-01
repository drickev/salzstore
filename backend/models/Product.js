const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['gold', 'bot_service', 'jockey'],
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'IDR',
  },
  serverName: String,
  status: {
    type: String,
    enum: ['available', 'closed'],
    default: 'available',
  },
  tier: {
    type: String,
    enum: ['elite', 'exclusive', 'daily', 'weekly', 'monthly'],
  },
  billingPeriod: String,
  description: String,
  benefit: String,
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
