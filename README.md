# Live Commerce MVP

Minimal live-commerce app with:
- React + Vite frontend
- Express + Socket.IO backend
- WebRTC signaling through Socket.IO

## Local Setup

### Frontend
1. Install dependencies:
   `npm install`
2. Run dev server:
   `npm run dev`
3. App runs on:
   `http://localhost:3000`

### Backend
1. Install dependencies:
   `cd backend && npm install`
2. Run backend:
   `npm start`
3. API/socket server runs on:
   `http://localhost:4000`

## Environment Variables

### Frontend (`Vite`)
- `VITE_SOCKET_URL`
  - Example local value: `http://localhost:4000`
  - Example Render value: `https://your-backend.onrender.com`
- `VITE_ICE_STUN_URLS`
  - Comma-separated STUN URLs
  - Default fallback is `stun:stun.l.google.com:19302`
- `VITE_ICE_TURN_URLS` (optional, recommended for production)
  - Comma-separated TURN URLs
  - Recommended order:
    `turns:turn.example.com:443?transport=tcp,turn:turn.example.com:3478?transport=udp`
- `VITE_ICE_TURN_USERNAME` (optional)
- `VITE_ICE_TURN_CREDENTIAL` (optional)
- `VITE_ICE_TRANSPORT_POLICY` (optional)
  - `all` (default) or `relay` (forces TURN-only media path)

### Backend
- `PORT` (optional, Render injects this automatically)
- `CORS_ORIGINS`
  - Comma-separated allowed origins
  - Example:
    `https://your-frontend.onrender.com,http://localhost:3000`

## Deploying on Render

You can deploy with `render.yaml` in this repo (Blueprint) or create services manually.

### Option A: Blueprint (`render.yaml`)
1. Push this repo to GitHub.
2. In Render: New -> Blueprint.
3. Select repo and apply.
4. After first deploy:
   - Open backend service.
   - Set `CORS_ORIGINS` to your frontend Render URL.
   - Redeploy backend.

### Option B: Manual services
1. Create Web Service for backend:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
2. Create Static Site for frontend:
   - Root Directory: project root
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Env vars:
     `VITE_SOCKET_URL=https://<backend-service>.onrender.com`
     `VITE_ICE_STUN_URLS=stun:stun.l.google.com:19302`
     `VITE_ICE_TURN_URLS=turns:<turn-host>:443?transport=tcp,turn:<turn-host>:3478?transport=udp`
     `VITE_ICE_TURN_USERNAME=<turn-username>`
     `VITE_ICE_TURN_CREDENTIAL=<turn-password>`
3. Set backend env var:
   - `CORS_ORIGINS=https://<frontend-service>.onrender.com`

## Testing the Live Stream

1. Open host page:
   `https://<frontend>.onrender.com/#/host`
2. Open watch page in another browser/incognito:
   `https://<frontend>.onrender.com/#/watch/1`
3. Click `Go Live` on host and confirm video appears on watcher.

## Notes

- ICE servers are now env-driven and shared between host and watcher clients.
- For strict corporate networks, configure TURN with `turns` over TCP 443 first, then optional UDP fallback.
- If you need deterministic relay behavior, set `VITE_ICE_TRANSPORT_POLICY=relay`.
