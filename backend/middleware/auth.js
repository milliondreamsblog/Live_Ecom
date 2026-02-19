const store = require('../store/sessionStore');

const checkBroadcaster = (socket, roomId) => {
    if (!store.isBroadcaster(roomId, socket.id)) {
        socket.emit('auth-error', { message: 'Not authorized for this action' });
        return false;
    }
    return true;
};

module.exports = { checkBroadcaster };
