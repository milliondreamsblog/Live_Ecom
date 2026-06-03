import { useEffect, useRef, useState } from 'react';
import { Room, RoomEvent, type RemoteTrack } from 'livekit-client';

export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface UseStreamOptions {
  /** When false the hook stays idle (lets apps keep P2P as the default). */
  enabled?: boolean;
  /** LiveKit server websocket URL. */
  serverUrl: string | null;
  /** Access token minted by the backend. */
  token: string | null;
  /** Host only: local media whose tracks should be published to the room. */
  publish?: MediaStream | null;
}

export interface UseStreamResult {
  /** Aggregated remote media (the stream a viewer renders). */
  remoteStream: MediaStream | null;
  status: StreamStatus;
}

/**
 * Connects to a LiveKit room (SFU) and exposes the remote media as a
 * MediaStream — a drop-in shape match for the legacy P2P useWebRTC hook, so
 * pages can switch backends behind a flag. Hosts pass `publish` to broadcast.
 */
export function useStream(opts: UseStreamOptions): UseStreamResult {
  const { enabled = true, serverUrl, token, publish } = opts;
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    if (!enabled || !serverUrl || !token) return;

    let cancelled = false;
    const room = new Room();
    roomRef.current = room;
    const media = new MediaStream();
    setRemoteStream(media);

    const sync = () => setRemoteStream(new MediaStream(media.getTracks()));

    const onSubscribed = (track: RemoteTrack) => {
      if (track.mediaStreamTrack) media.addTrack(track.mediaStreamTrack);
      sync();
    };
    const onUnsubscribed = (track: RemoteTrack) => {
      if (track.mediaStreamTrack) media.removeTrack(track.mediaStreamTrack);
      sync();
    };

    room.on(RoomEvent.TrackSubscribed, onSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, onUnsubscribed);

    setStatus('connecting');
    room
      .connect(serverUrl, token)
      .then(async () => {
        if (cancelled) return;
        setStatus('connected');
        if (publish) {
          for (const track of publish.getTracks()) {
            await room.localParticipant.publishTrack(track);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      room.off(RoomEvent.TrackSubscribed, onSubscribed);
      room.off(RoomEvent.TrackUnsubscribed, onUnsubscribed);
      room.disconnect();
      roomRef.current = null;
    };
  }, [enabled, serverUrl, token, publish]);

  return { remoteStream, status };
}
