const { AccessToken } = require('livekit-server-sdk');

/**
 * GET /api/livekit/token?room=&identity=&publish=
 * Mints a scoped LiveKit access token. The API key/secret stay on the server;
 * hosts get publish grants, viewers get subscribe-only. Returns 501 until the
 * LIVEKIT_* env vars are configured (P2P remains the default streaming path).
 */
const livekitToken = async (req, res) => {
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
    return res.status(501).json({ error: 'LiveKit is not configured on this server' });
  }

  const room = String(req.query.room || '');
  const identity = String(req.query.identity || '');
  const canPublish = String(req.query.publish) === 'true';

  if (!room || !identity) {
    return res.status(400).json({ error: 'room and identity are required' });
  }

  try {
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, { identity });
    at.addGrant({ roomJoin: true, room, canPublish, canSubscribe: true });
    const token = await at.toJwt();
    res.json({ token, url: LIVEKIT_URL });
  } catch (err) {
    console.error('LiveKit token error:', err);
    res.status(500).json({ error: 'Failed to mint LiveKit token' });
  }
};

module.exports = { livekitToken };
