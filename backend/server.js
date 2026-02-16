const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

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

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: origins.length > 0 ? origins : '*',
    methods: ['GET', 'POST']
  }
});

const views = {};
const sockMap = {};
const casts = {};
const coupons = {};
const polls = {};

io.on('connection', (sock) => {
  console.log('User connected:', sock.id);

  sock.on('join-room', (rid) => {
    sock.join(rid);
    sockMap[sock.id] = rid;

    if (!views[rid]) {
      views[rid] = 0;
    }
    views[rid] += 1;

    io.to(rid).emit('viewer-count', views[rid]);

    const c = coupons[rid];
    if (c && c.expiresAt > Date.now()) {
      sock.emit('current-coupon', c);
    }

    const p = polls[rid];
    if (p && p.isActive) {
      sock.emit('current-poll', p);
    }
  });

  sock.on('start-stream', (d) => {
    io.emit('stream-started', d);
  });

  sock.on('broadcaster', (rid) => {
    casts[rid] = sock.id;
    sock.broadcast.to(rid).emit('broadcaster');
  });

  sock.on('watcher', (rid) => {
    const castId = casts[rid];
    if (castId) {
      io.to(castId).emit('watcher', sock.id);
    }
  });

  sock.on('offer', (id, msg) => {
    io.to(id).emit('offer', sock.id, msg);
  });

  sock.on('answer', (id, msg) => {
    io.to(id).emit('answer', sock.id, msg);
  });

  sock.on('candidate', (id, msg) => {
    io.to(id).emit('candidate', sock.id, msg);
  });

  sock.on('send-reaction', (d) => {
    io.to(d.roomId).emit('receive-reaction', d.type);
  });

  sock.on('send-coupon', ({ roomId, code, duration }) => {
    const exp = Date.now() + duration * 1000;
    const c = { code, expiresAt: exp };
    coupons[roomId] = c;

    io.to(roomId).emit('new-coupon', c);

    setTimeout(() => {
      if (coupons[roomId] && coupons[roomId].expiresAt === exp) {
        delete coupons[roomId];
      }
    }, duration * 1000);
  });

  sock.on('create-poll', ({ roomId, question, options }) => {
    polls[roomId] = {
      question,
      options: options.map((t) => ({ text: t, votes: 0 })),
      isActive: true
    };
    io.to(roomId).emit('new-poll', polls[roomId]);
  });

  sock.on('vote-poll', ({ roomId, optionIndex }) => {
    const p = polls[roomId];
    if (p && p.isActive && p.options[optionIndex]) {
      p.options[optionIndex].votes += 1;
      io.to(roomId).emit('update-poll-results', p);
    }
  });

  sock.on('end-poll', ({ roomId }) => {
    if (polls[roomId]) {
      polls[roomId].isActive = false;
      io.to(roomId).emit('poll-ended');
      delete polls[roomId];
    }
  });

  sock.on('send-message', (d) => {
    const m = {
      id: Date.now().toString(),
      username: d.username,
      message: d.message,
      timestamp: Date.now()
    };

    io.to(d.roomId).emit('receive-message', m);
  });

  sock.on('disconnect', () => {
    const rid = sockMap[sock.id];

    if (rid && casts[rid] === sock.id) {
      delete casts[rid];
    }

    if (!rid) {
      return;
    }

    if (views[rid] > 0) {
      views[rid] -= 1;
    }
    io.to(rid).emit('viewer-count', views[rid] || 0);

    delete sockMap[sock.id];

    const castId = casts[rid];
    if (castId) {
      io.to(castId).emit('disconnectPeer', sock.id);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
