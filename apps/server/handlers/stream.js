const { Stream, Coupon, Poll } = require('../models');
const { checkBroadcaster } = require('../middleware/auth');
const { MAX_LEN, sanitize } = require('../utils');


module.exports = (io, socket, store) => {
    const joinRoom = async (rid) => {
        try {
            socket.join(rid);
            store.joinRoom(socket.id, rid);

            const viewerCount = Math.max(0, store.getViewerCount(rid) - 1);

            io.to(rid).emit('viewer-count', viewerCount);

            const c = await Coupon.findById(rid).lean();
            if (c && c.expiresAt > Date.now()) {
                socket.emit('current-coupon', { code: c.code, discount: c.discount, expiresAt: new Date(c.expiresAt).getTime() });
            }

            const p = await Poll.findById(rid).lean();
            if (p && p.isActive) {
                socket.emit('current-poll', { question: p.question, options: p.options, isActive: p.isActive });
            }
        } catch (err) {
            console.error('Error in join-room:', err);
        }
    };

    const startStream = async (d) => {
        try {
            const rid = d.roomId || d.id;
            if (!checkBroadcaster(socket, rid)) return;

            const title = sanitize(d.title, MAX_LEN.title) || 'Untitled Stream';
            const hostName = sanitize(d.hostName, MAX_LEN.hostName) || 'Anonymous Host';
            const category = sanitize(d.category, MAX_LEN.category) || 'General';

            await Stream.findOneAndUpdate(
                { _id: rid },
                { title, hostName, category, isLive: true, thumbnailUrl: `https://picsum.photos/800/600?random=${rid.substring(0, 8)}`, startedAt: Date.now() },
                { upsert: true, new: true }
            );
            io.emit('stream-started', { id: rid, title, hostName, category, roomId: rid });
        } catch (err) {
            console.error('Error in start-stream:', err);
        }
    };

    const endStream = async (d) => {
        try {
            const rid = d.roomId;
            if (!checkBroadcaster(socket, rid)) return;

            await Stream.deleteOne({ _id: rid });
            io.to(rid).emit('stream-ended', { roomId: rid });

        } catch (err) {
            console.error('Error in end-stream:', err);
        }
    };

    const claimBroadcaster = (rid) => {
        const existing = store.getBroadcaster(rid);
        if (existing && existing !== socket.id) {
            socket.emit('auth-error', { message: 'Broadcaster already exists for this room' });
            return;
        }
        store.setBroadcaster(rid, socket.id);
        socket.broadcast.to(rid).emit('broadcaster');
    };

    return {
        joinRoom,
        startStream,
        endStream,
        claimBroadcaster
    };
};
