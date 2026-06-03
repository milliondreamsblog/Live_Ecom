const crypto = require('crypto');
const { Order } = require('../models');

/**
 * POST /api/razorpay/webhook
 * Razorpay calls this when a payment is captured. We verify the HMAC signature
 * against RAZORPAY_WEBHOOK_SECRET, then transition the matching order to paid
 * and assign a delivery. Returns 501 until the secret is configured.
 */
const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(501).json({ error: 'Razorpay webhook not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  const expected = crypto
    .createHmac('sha256', secret)
    .update(req.rawBody || Buffer.from(''))
    .digest('hex');

  if (!signature || signature !== expected) {
    return res.status(400).json({ error: 'invalid signature' });
  }

  try {
    const event = req.body && req.body.event;
    const payload = (req.body && req.body.payload) || {};
    const rzpOrderId =
      (payload.payment && payload.payment.entity && payload.payment.entity.order_id) ||
      (payload.order && payload.order.entity && payload.order.entity.id);

    if ((event === 'payment.captured' || event === 'order.paid') && rzpOrderId) {
      const order = await Order.findOne({ razorpayOrderId: rzpOrderId });
      if (order && order.status === 'pending') {
        order.status = 'paid';
        await order.save();
        const { createDeliveryForOrder } = require('./deliveries');
        await createDeliveryForOrder(order._id);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('razorpayWebhook error:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};

module.exports = { razorpayWebhook };
