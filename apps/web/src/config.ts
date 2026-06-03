export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

/**
 * Which media backend to use: 'p2p' (legacy WebRTC mesh, the default) or
 * 'livekit' (SFU via @livedrop/streaming, requires LIVEKIT_* on the server).
 */
export const STREAMING_BACKEND: 'p2p' | 'livekit' =
    import.meta.env.VITE_STREAMING_BACKEND === 'livekit' ? 'livekit' : 'p2p';
