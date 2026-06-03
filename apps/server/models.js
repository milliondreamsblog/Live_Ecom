const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  _id: { type: String },
  title: { type: String, default: 'Untitled Stream' },
  hostName: { type: String, default: 'Anonymous Host' },
  category: { type: String, default: 'General' },
  isLive: { type: Boolean, default: true },
  thumbnailUrl: { type: String },
  startedAt: { type: Number }
});

const couponSchema = new mongoose.Schema({
  _id: { type: String },
  code: { type: String, required: true },
  discount: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});

const pollSchema = new mongoose.Schema({
  _id: { type: String },
  question: { type: String, required: true },
  options: [{
    _id: false,
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  isActive: { type: Boolean, default: true }
});

const orderSchema = new mongoose.Schema({
  _id: { type: String },
  roomId: { type: String },
  username: { type: String },
  items: [{
    _id: false,
    productId: { type: Number },
    name: { type: String },
    unitPricePaise: { type: Number },
    quantity: { type: Number }
  }],
  amountPaise: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  idempotencyKey: { type: String, index: true },
  razorpayOrderId: { type: String },
  createdAt: { type: Number }
});

const Stream = mongoose.model('Stream', streamSchema);
const Coupon = mongoose.model('Coupon', couponSchema);
const Poll = mongoose.model('Poll', pollSchema);
const Order = mongoose.model('Order', orderSchema);

module.exports = { Stream, Coupon, Poll, Order };
