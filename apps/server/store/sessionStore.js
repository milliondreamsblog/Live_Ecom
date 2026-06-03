class SessionStore {
    constructor() {
        this.views = {};
        this.sockMap = {};
        this.casts = {};
    }

    joinRoom(socketId, roomId) {
        this.sockMap[socketId] = roomId;
        if (!this.views[roomId]) {
            this.views[roomId] = 0;
        }
        this.views[roomId]++;
        return this.views[roomId];
    }

    leaveRoom(socketId) {
        const roomId = this.sockMap[socketId];
        if (roomId) {
            if (this.views[roomId] > 0) {
                this.views[roomId]--;
            }
            delete this.sockMap[socketId];
        }
        return roomId;
    }

    getViewerCount(roomId) {
        return this.views[roomId] || 0;
    }

    setBroadcaster(roomId, socketId) {
        this.casts[roomId] = socketId;
    }

    getBroadcaster(roomId) {
        return this.casts[roomId];
    }

    removeBroadcaster(roomId) {
        delete this.casts[roomId];
    }

    isBroadcaster(roomId, socketId) {
        return this.casts[roomId] === socketId;
    }

    getRoomId(socketId) {
        return this.sockMap[socketId];
    }
}

module.exports = new SessionStore();
