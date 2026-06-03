/**
 * Fetches a scoped LiveKit access token from the LiveDrop backend
 * (`GET /api/livekit/token`). The server holds the API key/secret and decides
 * publish vs. subscribe grants — clients never see the secret.
 */

export interface LiveKitToken {
  /** Signed LiveKit access token (JWT). */
  token: string;
  /** LiveKit server websocket URL to connect to. */
  url: string;
}

export interface FetchTokenParams {
  /** Room name (use the stream/room id). */
  room: string;
  /** Stable identity for this participant. */
  identity: string;
  /** Whether this participant may publish media (host) or only subscribe. */
  publish?: boolean;
}

export async function fetchLiveKitToken(
  apiBase: string,
  params: FetchTokenParams,
): Promise<LiveKitToken> {
  const query = new URLSearchParams({
    room: params.room,
    identity: params.identity,
    publish: String(Boolean(params.publish)),
  });

  const res = await fetch(`${apiBase}/api/livekit/token?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`LiveKit token request failed: ${res.status}`);
  }
  return (await res.json()) as LiveKitToken;
}
