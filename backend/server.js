require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { Stream, Coupon, Poll } = require('./models');
const store = require('./store/sessionStore');

const streamHandler = require('./handlers/stream');
const signalingHandler = require('./handlers/signaling');
const chatHandler = require('./handlers/chat');
const commerceHandler = require('./handlers/commerce');
const pollsHandler = require('./handlers/polls');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

const origins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const opts = origins.length > 0 ? { origin: origins } : {};

app.use(cors(opts));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

const formatStream = (s) => {
  const rawCount = store.getViewerCount(s._id);
  const viewers = Math.max(0, rawCount - 1);
  return {
    id: s._id,
    title: s.title,
    hostName: s.hostName,
    category: s.category,
    isLive: s.isLive,
    thumbnailUrl: s.thumbnailUrl,
    startedAt: s.startedAt,
    viewers
  };
};

app.get('/api/streams', async (req, res) => {
  try {
    const streams = await Stream.find().lean();
    res.json(streams.map(formatStream));
  } catch (err) {
    console.error('Error fetching streams:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/streams/:id', async (req, res) => {
  try {
    const s = await Stream.findById(req.params.id).lean();
    if (!s) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    res.json(formatStream(s));
  } catch (err) {
    console.error('Error fetching stream:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: origins.length > 0 ? origins : '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (sock) => {
  console.log('User connected:', sock.id);

  const stream = streamHandler(io, sock, store);
  const signaling = signalingHandler(io, sock, store);
  const chat = chatHandler(io, sock, store);
  const commerce = commerceHandler(io, sock, store);
  const polls = pollsHandler(io, sock, store);

  sock.on('join-room', stream.joinRoom);
  sock.on('start-stream', stream.startStream);
  sock.on('end-stream', stream.endStream);
  sock.on('broadcaster', stream.claimBroadcaster);

  sock.on('watcher', signaling.handleWatcher);
  sock.on('offer', signaling.handleOffer);
  sock.on('answer', signaling.handleAnswer);
  sock.on('candidate', signaling.handleCandidate);

  sock.on('send-message', chat.sendMessage);
  sock.on('send-reaction', chat.sendReaction);

  sock.on('send-coupon', commerce.sendCoupon);
  sock.on('feature-product', commerce.featureProduct);
  sock.on('product-purchased', commerce.productPurchased);

  sock.on('create-poll', polls.createPoll);
  sock.on('vote-poll', polls.votePoll);
  sock.on('end-poll', polls.endPoll);

  sock.on('disconnect', async () => {
    try {
      const rid = store.getRoomId(sock.id);

      if (store.isBroadcaster(rid, sock.id)) {
        store.removeBroadcaster(rid);
        await Stream.deleteOne({ _id: rid });
        io.to(rid).emit('stream-ended', { roomId: rid });
      }

      if (rid) {
        store.leaveRoom(sock.id);
        const views = Math.max(0, store.getViewerCount(rid) - 1);

        io.to(rid).emit('viewer-count', views);

        const castId = store.getBroadcaster(rid);
        if (castId) {
          io.to(castId).emit('disconnectPeer', sock.id);
        }
      }
    } catch (err) {
      console.error('Error in disconnect:', err);
    }
  });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Stream.deleteMany({});
    await Coupon.deleteMany({});
    await Poll.deleteMany({});
    console.log('Cleaned up stale data');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
