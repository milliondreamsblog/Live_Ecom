/**
 * LiveKit streaming, re-exported from @livedrop/streaming. Available behind the
 * STREAMING_BACKEND flag; pages stay on the P2P useWebRTC hook until LiveKit is
 * configured (server LIVEKIT_* + VITE_STREAMING_BACKEND=livekit).
 */
export { useStream, fetchLiveKitToken } from '@livedrop/streaming';
export type { StreamStatus, UseStreamResult, LiveKitToken, FetchTokenParams } from '@livedrop/streaming';
