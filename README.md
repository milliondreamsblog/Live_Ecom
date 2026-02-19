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

- `backend/` -> Node/Express + Socket.IO signaling server
- `pages/Host.tsx` -> Host stream screen
- `pages/Watch.tsx` -> Viewer stream screen
- `services/rtcConfig.ts` -> ICE/STUN/TURN config from env vars
- `render.yaml` -> Render Blueprint config

## Run Locally (2 terminals)

Prerequisites:
- Node.js 18+ (Node 20 recommended)
- npm

1. Install frontend dependencies:
   ```bash
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. Start backend (Terminal 1):
   ```bash
   cd backend
   npm start
   ```
   Backend runs on `http://localhost:4000`

4. Start frontend (Terminal 2):
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

5. Test streaming locally:
   - Host page: `http://localhost:3000/#/host`
   - Viewer page: `http://localhost:3000/#/watch/1`
   - Open host and viewer in different tabs (or one incognito tab), then click `Go Live`.

## Environment Variables

### Frontend vars (`Vite`)

You can set these in Render or in local `.env.local`.

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
