const crypto = require('crypto');
const { Order } = require('../models');

const toPaise = (rupees) => Math.round((Number(rupees) || 0) * 100);

const serialize = (o) => ({
  id: o._id,
  roomId: o.roomId,
  username: o.username,
  items: (o.items || []).map((i) => ({
    productId: i.productId,
    name: i.name,
    unitPricePaise: i.unitPricePaise,
    quantity: i.quantity,
  })),
  amountPaise: o.amountPaise,
  status: o.status,
  razorpayOrderId: o.razorpayOrderId,
  createdAt: o.createdAt,
});

/** POST /api/orders — create a pending order (idempotent via idempotencyKey). */
const createOrder = async (req, res) => {
  try {
    const { roomId, username, items, idempotencyKey } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items are required' });
    }

    if (idempotencyKey) {
      const existing = await Order.findOne({ idempotencyKey }).lean();
      if (existing) return res.status(200).json(serialize(existing));
    }

    const orderItems = items.map((i) => ({
      productId: Number(i.productId),
      name: String(i.name || ''),
      unitPricePaise: toPaise(i.priceRupees),
      quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
    }));
    const amountPaise = orderItems.reduce((sum, i) => sum + i.unitPricePaise * i.quantity, 0);

    const order = await Order.create({
      _id: `ord_${crypto.randomUUID()}`,
      roomId,
      username,
      items: orderItems,
      amountPaise,
      status: 'pending',
      idempotencyKey: idempotencyKey || undefined,
      createdAt: Date.now(),
    });

    res.status(201).json(serialize(order));
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

/** GET /api/orders/:id */
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(serialize(order));
  } catch (err) {
    console.error('getOrder error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

/**
 * POST /api/orders/:id/pay
 * With RAZORPAY_* set: creates a real Razorpay order and returns it for the
 * client to complete checkout (capture confirmed later via webhook).
 * Without it: mock-pays immediately so the dev flow works end to end.
 */
const payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') {
      return res.status(409).json({ error: `Order is already ${order.status}` });
    }

    const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      const Razorpay = require('razorpay');
      const rzp = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
      const rzpOrder = await rzp.orders.create({
        amount: order.amountPaise,
        currency: 'INR',
        receipt: order._id,
      });
      order.razorpayOrderId = rzpOrder.id;
      await order.save();
      return res.json({
        order: serialize(order),
        razorpay: { orderId: rzpOrder.id, keyId: RAZORPAY_KEY_ID, amount: order.amountPaise },
      });
    }

    // Mock payment (no Razorpay configured): pending -> paid + assign delivery.
    order.status = 'paid';
    await order.save();
    const { createDeliveryForOrder } = require('./deliveries');
    await createDeliveryForOrder(order._id);
    res.json({ order: serialize(order), mock: true });
  } catch (err) {
    console.error('payOrder error:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

module.exports = { createOrder, getOrder, payOrder };
