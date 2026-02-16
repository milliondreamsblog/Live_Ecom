/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_ICE_STUN_URLS?: string;
  readonly VITE_ICE_TURN_URLS?: string;
  readonly VITE_ICE_TURN_USERNAME?: string;
  readonly VITE_ICE_TURN_CREDENTIAL?: string;
  readonly VITE_ICE_TRANSPORT_POLICY?: 'all' | 'relay';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
