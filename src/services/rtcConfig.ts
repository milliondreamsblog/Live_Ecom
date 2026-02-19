const DEFAULT_STUN_URL = 'stun:stun.l.google.com:19302';

const parseCsv = (value: string | undefined): string[] => {
    if (!value) return [];
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
};

const getIceServers = (): RTCIceServer[] => {
    const stunUrls = parseCsv(import.meta.env.VITE_ICE_STUN_URLS);
    const turnUrls = parseCsv(import.meta.env.VITE_ICE_TURN_URLS);
    const turnUsername = import.meta.env.VITE_ICE_TURN_USERNAME?.trim();
    const turnCredential = import.meta.env.VITE_ICE_TURN_CREDENTIAL?.trim();

    const iceServers: RTCIceServer[] = [];

    if (stunUrls.length > 0) {
        iceServers.push({ urls: stunUrls });
    } else {
        iceServers.push({ urls: DEFAULT_STUN_URL });
    }

    if (turnUrls.length > 0) {
        const turnServer: RTCIceServer = { urls: turnUrls };

        if (turnUsername) {
            turnServer.username = turnUsername;
        }

        if (turnCredential) {
            turnServer.credential = turnCredential;
        }

        iceServers.push(turnServer);
    }

    return iceServers;
};

const iceTransportPolicy = import.meta.env.VITE_ICE_TRANSPORT_POLICY === 'relay' ? 'relay' : 'all';

export const PC_CONFIG: RTCConfiguration = {
    iceServers: getIceServers(),
    iceTransportPolicy
};
