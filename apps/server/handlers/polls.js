const { Poll } = require('../models');
const { checkBroadcaster } = require('../middleware/auth');
const { MAX_LEN, sanitize } = require('../utils');


module.exports = (io, socket, store) => {
    const createPoll = async ({ roomId, question, options }) => {
        try {
            if (!checkBroadcaster(socket, roomId)) return;

            const cleanQ = sanitize(question, MAX_LEN.pollQuestion);
            if (!cleanQ || !Array.isArray(options) || options.length === 0) return;

            const cleanOpts = options
                .map((t) => sanitize(t, MAX_LEN.pollOption))
                .filter(Boolean);

            if (cleanOpts.length === 0) return;

            const pollData = {
                question: cleanQ,
                options: cleanOpts.map((t) => ({ text: t, votes: 0 })),
                isActive: true
            };

            await Poll.findOneAndUpdate({ _id: roomId }, pollData, { upsert: true });
            io.to(roomId).emit('new-poll', pollData);
        } catch (err) {
            console.error('Error in create-poll:', err);
        }
    };

    const votePoll = async ({ roomId, optionIndex }) => {
        try {
            if (store.getRoomId(socket.id) !== roomId) return;

            const idx = Number(optionIndex);
            if (!Number.isInteger(idx) || idx < 0) return;

            const p = await Poll.findOneAndUpdate(
                { _id: roomId, isActive: true, [`options.${idx}`]: { $exists: true } },
                { $inc: { [`options.${idx}.votes`]: 1 } },
                { new: true }
            ).lean();

            if (p) {
                io.to(roomId).emit('update-poll-results', { question: p.question, options: p.options, isActive: p.isActive });
            }
        } catch (err) {
            console.error('Error in vote-poll:', err);
        }
    };

    const endPoll = async ({ roomId }) => {
        try {
            if (!checkBroadcaster(socket, roomId)) return;

            const deleted = await Poll.findOneAndDelete({ _id: roomId });
            if (deleted) {
                io.to(roomId).emit('poll-ended');
            }
        } catch (err) {
            console.error('Error in end-poll:', err);
        }
    };

    return {
        createPoll,
        votePoll,
        endPoll
    };
};
