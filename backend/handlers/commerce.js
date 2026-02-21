const { Coupon } = require('../models');
const { checkBroadcaster } = require('../middleware/auth');
const { MAX_LEN, sanitize } = require('../utils');


module.exports = (io, socket, store) => {
    const sendCoupon = async ({ roomId, code, discount, duration }) => {
        try {
            if (!checkBroadcaster(socket, roomId)) return;

            const cleanCode = sanitize(code, MAX_LEN.couponCode);
            const dur = Math.min(Math.max(Number(duration) || 0, 1), 3600);
            const exp = Date.now() + dur * 1000;
            const discountPct = Number.isFinite(Number(discount)) ? Math.min(Math.max(Number(discount), 0), 100) : 20;

            const c = { code: cleanCode, discount: discountPct, expiresAt: exp };
            await Coupon.findOneAndUpdate({ _id: roomId }, c, { upsert: true });

            io.to(roomId).emit('new-coupon', c);

            setTimeout(async () => {
                try {
                    const existing = await Coupon.findById(roomId).lean();
                    if (existing && existing.expiresAt.getTime() === exp) {
                        await Coupon.deleteOne({ _id: roomId });
                        io.to(roomId).emit('coupon-expired');
                    }
                } catch (e) {
                    console.error("Coupon cleanup error", e);
                }
            }, dur * 1000);

        } catch (err) {
            console.error(err);
        }
    };

    const featureProduct = ({ roomId, product }) => {
        try {
            if (!checkBroadcaster(socket, roomId)) return;
            if (!product || !product.id) return;
            const safe = {
                id: Number(product.id),
                name: sanitize(String(product.name || ''), MAX_LEN.message),
                price: Number(product.price) || 0,
                image: String(product.image || '').slice(0, 500),
                category: sanitize(String(product.category || ''), 50),
            };

            io.to(roomId).emit('featured-product', safe);
        } catch (err) {
            console.error('featureProduct error', err);
        }
    };

    const productPurchased = ({ roomId, username, product }) => {
        try {
            if (!roomId || !product?.id) return;
            io.to(roomId).emit('product-purchased', {
                username: sanitize(String(username || 'Someone'), MAX_LEN.message),
                product: {
                    id: Number(product.id),
                    name: sanitize(String(product.name || ''), MAX_LEN.message),
                    price: Number(product.price) || 0
                }
            });
        } catch (e) {
            console.error('purchase relay err', e);
        }
    };

    return {
        sendCoupon,
        featureProduct,
        productPurchased,
    };
};
