module.exports = (io, socket, store) => {
    const handleWatcher = (rid) => {
        const castId = store.getBroadcaster(rid);
        if (castId) {
            io.to(castId).emit('watcher', socket.id);
        }
    };

    const handleOffer = (id, msg) => {
        io.to(id).emit('offer', socket.id, msg);
    };

    const handleAnswer = (id, msg) => {
        io.to(id).emit('answer', socket.id, msg);
    };

    const handleCandidate = (id, msg) => {
        io.to(id).emit('candidate', socket.id, msg);
    };

    return {
        handleWatcher,
        handleOffer,
        handleAnswer,
        handleCandidate
    };
};
