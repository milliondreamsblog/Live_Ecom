# Live Commerce MVP

This is a simple live-commerce demo where:
- A host starts a live stream
- Viewers join, react, chat, and vote in polls
- Coupons can be pushed live during the stream

Built with:
- Frontend: React + Vite + Socket.IO client + WebRTC
- Backend: Express + Socket.IO

## Live Deployment

- Frontend: `https://live-commerce-frontend.onrender.com`
- Backend: `https://live-commerce-backend.onrender.com`
- Host page: `https://live-commerce-frontend.onrender.com/#/host`
- Viewer page: `https://live-commerce-frontend.onrender.com/#/watch/1`
- Backend health check: `https://live-commerce-backend.onrender.com/health`

## Project Structure

Turborepo + pnpm monorepo:

- `apps/web/` -> React + Vite frontend (Socket.IO client + WebRTC)
- `apps/mobile/` -> Expo (React Native) app (Expo Router) — live feed, watch
  (chat/polls/coupons/cart/checkout/tracker) + host Go Live; shares all logic
  with web. Run with `pnpm --filter @livedrop/mobile start` (Expo).
  Live video + host camera are placeholders pending native deps.
- `apps/server/` -> Node/Express + Socket.IO signaling server
- `packages/core/` -> shared domain schemas + types (zod) + money helpers
- `packages/realtime/` -> typed Socket.IO event contract + SocketProvider/useSocket
- `packages/features/` -> headless cross-platform hooks (useChat/usePolls/useCoupons)
- `packages/ui/` -> design tokens (source of truth) + Tailwind v4 theme
- `packages/config/` -> shared tsconfig presets
- `apps/web/src/pages/Host.tsx` -> Host stream screen
- `apps/web/src/pages/Watch.tsx` -> Viewer stream screen
- `apps/web/src/services/rtcConfig.ts` -> ICE/STUN/TURN config from env vars
- `render.yaml` -> Render Blueprint config
- `plan.md` -> cross-platform / live-quick-commerce roadmap

## Run Locally (2 terminals)

Prerequisites:
- Node.js 20+
- pnpm 10 (run `corepack enable` to get it)

1. Install all workspace dependencies (from the repo root):
   ```bash
   pnpm install
   ```

2. Start the backend (Terminal 1):
   ```bash
   pnpm --filter @livedrop/server start
   ```
   Backend runs on `http://localhost:4000`

3. Start the frontend (Terminal 2):
   ```bash
   pnpm --filter @livedrop/web dev
   ```
   Frontend runs on `http://localhost:3000`

   Useful root scripts: `pnpm build`, `pnpm typecheck`, `pnpm test` (run
   across the workspace via Turborepo). CI runs the same on every push/PR
   (`.github/workflows/ci.yml`).

4. Test streaming locally:
   - Host page: `http://localhost:3000/#/host`
   - Viewer page: `http://localhost:3000/#/watch/1`
   - Open host and viewer in different tabs (or one incognito tab), then click `Go Live`.

## Environment Variables

### Frontend vars (`Vite`)

You can set these in Render or in local `apps/web/.env`.

- `VITE_SOCKET_URL`
  - Local: `http://localhost:4000`
  - Render: `https://live-commerce-backend.onrender.com`

- `VITE_ICE_STUN_URLS`
  - Comma-separated STUN URLs
  - Example: `stun:stun.l.google.com:19302`

- `VITE_ICE_TURN_URLS` (optional, recommended in production)
  - Comma-separated TURN URLs
  - Recommended order:
    `turns:<turn-host>:443?transport=tcp,turn:<turn-host>:3478?transport=udp`

- `VITE_ICE_TURN_USERNAME` (optional)
- `VITE_ICE_TURN_CREDENTIAL` (optional)
- `VITE_ICE_TRANSPORT_POLICY` (optional)
  - `all` (default)
  - `relay` (forces TURN relay only, useful for strict corporate networks)

### Backend vars

- `PORT` (optional, Render sets it automatically)
- `CORS_ORIGINS`
  - Comma-separated allowed frontend origins
  - Example:
    `https://live-commerce-frontend.onrender.com,http://localhost:3000`

## Deploy on Render (Recommended: Blueprint)

This repo already includes `render.yaml`.

1. Push this repo to GitHub.
2. In Render, click `New` -> `Blueprint`.
3. Select your repo and deploy.
4. Fill env vars during setup:
   - Backend `CORS_ORIGINS` -> `https://live-commerce-frontend.onrender.com`
   - Frontend `VITE_SOCKET_URL` -> `https://live-commerce-backend.onrender.com`
   - Frontend `VITE_ICE_STUN_URLS` -> `stun:stun.l.google.com:19302`
   - TURN vars optional (recommended if users are on restricted networks)
5. After services are created, confirm URLs and redeploy if you changed env vars.

## Verify Deployment

1. Health check backend:
   - `https://live-commerce-backend.onrender.com/health`
2. Open host:
   - `https://live-commerce-frontend.onrender.com/#/host`
3. Open viewer:
   - `https://live-commerce-frontend.onrender.com/#/watch/1`
4. Start stream and verify video appears on viewer side.

## Common Issues

- No video on viewer:
  - Check browser camera/mic permissions on host.
  - Make sure `VITE_SOCKET_URL` points to the correct backend URL.
  - Add TURN config for strict firewalls/corporate networks.

- Socket connects locally but not on Render:
  - Check backend `CORS_ORIGINS` exactly matches frontend URL.
  - Redeploy backend after updating env vars.

- Whole app looks dead (no streams, chat, or video, and no errors):
  - The backend almost certainly isn't reachable. Both servers must be
    running locally (backend on `:4000`, frontend on `:3000`).
  - A "Connecting to server…" / "Disconnected — reconnecting…" banner now
    appears bottom-center whenever the socket isn't connected.
  - On Render's free tier the backend sleeps after ~15 min idle and takes
    ~50s to cold-start; the banner clears once it wakes.

- Video never appears across different networks (works on same machine/LAN):
  - Plain STUN can't traverse most NATs. Configure the `VITE_ICE_TURN_*`
    vars with a real TURN relay (see Environment Variables above).
