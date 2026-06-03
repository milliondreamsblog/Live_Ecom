const { Delivery } = require('../models');

const RIDERS = ['Ravi', 'Sunil', 'Imran', 'Lakshmi', 'Manoj', 'Priya'];

/** Create (or reset) a delivery for a paid order. */
const createDeliveryForOrder = async (orderId) => {
  const riderName = RIDERS[Math.floor(Math.random() * RIDERS.length)];
  return Delivery.findOneAndUpdate(
    { _id: orderId },
    { _id: orderId, orderId, riderName, status: 'assigned', etaMinutes: 10, createdAt: Date.now() },
    { upsert: true, new: true },
  );
};

/**
 * Deterministic simulated rider: progress is derived from elapsed time since
 * the delivery was created, so the "10-minute" tracking demo works without a
 * real fleet or background jobs. (Compressed to ~90s for demoing.)
 */
const simulate = (createdAt) => {
  const elapsed = (Date.now() - createdAt) / 1000; // seconds
  if (elapsed < 20) return { status: 'assigned', etaMinutes: 10 };
  if (elapsed < 40) return { status: 'picked_up', etaMinutes: 8 };
  if (elapsed < 90) return { status: 'en_route', etaMinutes: Math.max(1, Math.ceil((90 - elapsed) / 12)) };
  return { status: 'delivered', etaMinutes: 0 };
};

/** GET /api/deliveries/:orderId — current (simulated) delivery state. */
const getDelivery = async (req, res) => {
  try {
    const d = await Delivery.findById(req.params.orderId);
    if (!d) return res.status(404).json({ error: 'Delivery not found' });

    const sim = simulate(d.createdAt);
    if (d.status !== sim.status) {
      d.status = sim.status;
      d.etaMinutes = sim.etaMinutes;
      await d.save();
    } else {
      d.etaMinutes = sim.etaMinutes;
    }

    res.json({
      orderId: d.orderId,
      riderName: d.riderName,
      status: d.status,
      etaMinutes: d.etaMinutes,
      createdAt: d.createdAt,
    });
  } catch (err) {
    console.error('getDelivery error:', err);
    res.status(500).json({ error: 'Failed to fetch delivery' });
  }
};

module.exports = { createDeliveryForOrder, getDelivery };
