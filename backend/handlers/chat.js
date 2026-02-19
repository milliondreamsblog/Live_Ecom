const { MAX_LEN, sanitize } = require('../utils');


module.exports = (io, socket, store) => {
    const sendMessage = (d) => {
        if (store.getRoomId(socket.id) !== d.roomId) return;

        const username = sanitize(d.username, MAX_LEN.username);
        const message = sanitize(d.message, MAX_LEN.message);

        if (!username || !message) return;

        const m = {
            id: Date.now().toString(),
            username,
            message,
            timestamp: Date.now()
        };

        io.to(d.roomId).emit('receive-message', m);
    };

    const sendReaction = (d) => {
        if (store.getRoomId(socket.id) !== d.roomId) return;

        const type = sanitize(d.type, MAX_LEN.reactionType);
        if (!type) return;

        io.to(d.roomId).emit('receive-reaction', type);
    };

    return {
        sendMessage,
        sendReaction
    };
};
