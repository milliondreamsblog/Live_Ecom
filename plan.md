# LiveDrop — Refactor to a Cross-Platform Live Quick-Commerce Monorepo

> Working codename: **LiveDrop** (live shopping + instant "drops" + 10-minute delivery).
> Author: platform/design lead. Status: proposed. Supersedes the single-app MVP.

---

## 1. Product thesis

Today's MVP is **live shopping**: a host streams, viewers chat/react/vote, coupons fly, a cart exists, "Pay Now" is a fake `alert()`. It's a good skeleton but it's one Vite SPA + one Express server doing everything over **P2P WebRTC** — which structurally caps a "stream" at ~3–4 viewers and has no real checkout, inventory, payments, or fulfilment.

The new thesis fuses two behaviours:

1. **Live commerce** (TikTok Shop / Whatnot / Bigo): immersive, vertical, host-led, urgency-driven shopping as entertainment.
2. **Quick commerce** (Blinkit / Zepto / Instamart): hyperlocal dark-store inventory, **10-minute delivery**, live order tracking.

> **The unlock:** you watch a host drop a Banarasi saree at ₹2,499, tap *Buy*, pay with UPI, and a rider from the nearest dark store is at your door in minutes — all without leaving the stream. "Live → Buy → Doorstep" as one continuous, swipeable surface.

The product must feel **native-grade on mobile** (the primary surface, TikTok-style vertical FYP) and **polished on web** (discovery + desktop theatre + creator studio).

---

## 2. Current state → target state

| Dimension | Today (MVP) | Target (LiveDrop) |
|---|---|---|
| Repo | Single Vite app + `backend/` folder | **Turborepo + pnpm** workspaces: `apps/*` + `packages/*` |
| Clients | Web only (React 19 + Vite, HashRouter) | **Web (Next.js)** + **Mobile (Expo/React Native)**, shared logic |
| Streaming | P2P WebRTC mesh ([useWebRTC.ts](src/hooks/useWebRTC.ts)) — caps ~4 viewers | **LiveKit SFU** — thousands of viewers, RN + web SDKs |
| Realtime | Socket.IO, single node, in-memory `sessionStore` | Socket.IO + **Redis adapter** (horizontal scale), typed event contracts |
| Data | MongoDB, ephemeral, wiped on boot ([server.js](backend/server.js)) | **Postgres + Prisma** (transactional) + **Redis** (ephemeral/presence) |
| Auth | `localStorage` "user" ([AuthContext.tsx](src/contexts/AuthContext.tsx)) | Real auth (Clerk/OTP), JWT, roles, sessions |
| Payments | `alert('Demo payment successful')` ([Watch.tsx](src/pages/Watch.tsx)) | **Razorpay (UPI/₹)** + Stripe, idempotent orders |
| Commerce | Mock products, client cart | Catalog, **hyperlocal inventory**, orders, **delivery tracking** |
| Types | Hand-written, duplicated client/server | **`@livedrop/core`** shared zod schemas + types |
| UI | One Tailwind theme, desktop-first | **Design-token system**, mobile-first immersive + web responsive |

---

## 3. Guiding principles

1. **Share logic, not pixels.** One source of truth for types, validation, state machines, and realtime contracts. Presentation stays platform-idiomatic so each feels native.
2. **Mobile is the hero.** Design vertical-first; web adapts up. The stream is full-bleed, gesture-driven, 60fps.
3. **Typed end-to-end.** Every socket event and API payload is a zod schema in `@livedrop/core`. No stringly-typed events.
4. **Realtime is ephemeral, commerce is durable.** Presence/viewer-count/live-cart live in Redis; orders/inventory/payments live in Postgres with audit trails.
5. **Urgency is the UX.** Countdowns, low-stock, "X bought this", flash drops — make the live moment feel scarce and alive.
6. **Every surface degrades gracefully.** Connection banners, skeletons, optimistic UI, offline carts. (We already started this with [ConnectionStatus.tsx](src/components/ConnectionStatus.tsx).)

---

## 4. Monorepo architecture

**Tooling: Turborepo + pnpm workspaces.** (Rationale: best-in-class task caching, first-class Vercel + Expo support, simplest mental model vs Nx for a team this size. Remote caching gives sub-second CI on unchanged packages.)

```
livedrop/
├── apps/
│   ├── web/                 # Next.js 15 (App Router) — discovery, watch, creator studio
│   ├── mobile/              # Expo (React Native) — the hero app
│   └── server/              # Node API + Socket.IO realtime gateway
├── packages/
│   ├── core/                # domain types + zod schemas + pure business logic
│   ├── realtime/            # typed Socket.IO client + event contract + React hooks
│   ├── api-client/          # typed REST/tRPC client (TanStack Query bindings)
│   ├── streaming/           # LiveKit wrappers (token mint, room hooks) for web+native
│   ├── ui/                  # design tokens + cross-platform primitives
│   ├── ui-web/              # web-only components (Radix + Tailwind)
│   ├── ui-native/           # native-only components (NativeWind + Reanimated)
│   ├── features/            # headless feature hooks (useLiveRoom, useCheckout, useCart…)
│   └── config/              # eslint, tsconfig, tailwind preset, prettier
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── plan.md
```

**Dependency rule (enforced by ESLint boundaries):**
`apps/*` → `features` → `{core, realtime, api-client, streaming, ui*}` → `core`.
`apps` never import each other; `core` imports nothing internal.

**What moves where from today's tree:**
- `src/` (the whole Vite app) → re-platformed into `apps/web` (Next App Router).
- `backend/` → `apps/server`, handlers split into modules (already clean: [handlers/](backend/handlers/)).
- `src/types.ts` → `packages/core/src/schema.ts` (as zod schemas, types inferred).
- `src/hooks/use{Chat,Polls,Coupons,WebRTC}.ts` → `packages/features/*` (headless, platform-agnostic).
- `src/contexts/SocketContext.tsx` logic → `packages/realtime`.
- Tailwind theme → `packages/ui` tokens + `packages/config/tailwind-preset`.

---

## 5. Tech stack decisions (with rationale + alternatives)

| Layer | Pick | Why | Alternatives considered |
|---|---|---|---|
| Monorepo | **Turborepo + pnpm** | Caching, Vercel/Expo native, simple | Nx (heavier), Bun workspaces (less mature for RN) |
| Web | **Next.js 15 App Router** | SSR/SEO for shareable stream+product pages, RSC, Vercel | Keep Vite SPA (no SEO), Remix |
| Mobile | **Expo (RN) + Expo Router** | OTA updates, EAS builds, best DX, LiveKit + Reanimated support | Bare RN (more ops), Flutter (no code share) |
| Streaming | **LiveKit (Cloud or self-host SFU)** | Scales to thousands, web + RN SDKs, recording, simulcast | P2P (caps ~4, current pain), Agora/100ms (closed), Mux (one-way only) |
| Realtime msg | **Socket.IO + Redis adapter (Upstash)** | Keep existing handlers, add horizontal scale + presence | Ably/Pusher (cost), raw WS (reinvent) |
| API | **tRPC** (+ thin REST for webhooks) | End-to-end types, zero codegen, pairs with zod/core | REST+OpenAPI, GraphQL (overkill) |
| DB (durable) | **Postgres (Neon) + Prisma** | Transactions for orders/inventory/payments, relational | Stay on Mongo (weak for txn commerce) |
| Store (ephemeral) | **Redis (Upstash)** | Presence, viewer counts, live carts, rate-limit, locks | In-memory (current, single-node only) |
| Auth | **Clerk** (phone/OTP first) | Drop-in web+RN, India OTP, orgs for creators | Auth.js, Supabase Auth |
| Payments | **Razorpay** (UPI/₹) + Stripe | India-first UPI, then global | Stripe-only (poor UPI), Cashfree |
| Maps/tracking | **Mapbox** (web) / RN Maps | Live rider ETA, dark-store geofencing | Google Maps (cost) |
| State/data fetch | **TanStack Query + Zustand** | Server cache + light client state, RN+web | Redux (boilerplate) |
| Styling | **Tailwind (web) + NativeWind (native)** | One token language, two renderers | Tamagui (write-once, see §12) |
| Motion | **Framer Motion (web) / Reanimated 3 + Gesture Handler (native)** | 60fps gestures, the TikTok feel | CSS-only (not enough) |
| Obs | **Sentry + OpenTelemetry + Axiom** | Errors, traces, logs across apps | — |

---

## 6. Shared packages — the contract layer

### `packages/core`
The single source of truth. Pure TS + zod, no React, no platform APIs.
- **Schemas:** `Product`, `Stream`, `Order`, `CartItem`, `Coupon`, `Poll`, `User`, `DarkStore`, `Delivery`, `Money` (₹ minor-units, never floats for money).
- **State machines** (xstate or hand-rolled): `OrderStatus` (`pending → paid → packing → out_for_delivery → delivered`), `StreamStatus`, `DeliveryStatus`.
- **Pure logic:** cart totals, discount application (port [CartContext.tsx](src/contexts/CartContext.tsx) math), ETA estimation, inventory reservation rules.

### `packages/realtime`
- The **event contract**: one typed map of every Socket.IO event (see §13). Both client and `apps/server` import it — impossible to drift like today's hand-matched strings.
- `createRealtimeClient()` + React hooks (`useRoomEvent`, `usePresence`). Port the resilience work from [SocketContext.tsx](src/contexts/SocketContext.tsx) (status, reconnect) into a platform-agnostic core.

### `packages/features` (headless hooks — the big win)
Each hook returns data + actions, **zero JSX**, consumed identically by web and native:
- `useLiveRoom(streamId)` → `{ video, host, viewers, status, messages, send, react }`
- `useCheckout()` → `{ cart, applyCoupon, placeOrder, paymentSheet }`
- `usePolls`, `useCoupons`, `useFeaturedProduct`, `useDeliveryTracking(orderId)`
These are direct, cleaned-up descendants of today's `src/hooks/*`.

---

## 7. Streaming architecture (the most important rewrite)

**Why P2P must go.** Today every viewer opens a `RTCPeerConnection` directly to the host ([useWebRTC.ts](src/hooks/useWebRTC.ts)); the host's uplink and CPU melt past a handful of viewers, and it silently fails across NATs without TURN (a finding from the audit). A live-commerce stream needs hundreds–thousands of concurrent viewers.

**Target: LiveKit SFU.**
```
Host (publisher) ──▶ LiveKit SFU ──┬──▶ Viewer 1
                                   ├──▶ Viewer 2
   server mints                    ├──▶ … (simulcast: SFU sends each
   scoped JWT                      └──▶ Viewer N   viewer the layer their
                                                   bandwidth allows)
```
- `apps/server` mints **scoped LiveKit access tokens** (publish for host, subscribe for viewers) — reuses the existing broadcaster-authz idea from [middleware/auth.js](backend/middleware/auth.js).
- `packages/streaming` wraps `@livekit/components-react` (web) and `@livekit/react-native` (mobile) behind one `useStream()` API.
- Free wins: **simulcast** (adaptive quality), **recording** (replay drops as VOD), **egress** to HLS for cheap edge fan-out, **ingest** for pro hosts using OBS.
- Socket.IO stays for **data** (chat, reactions, polls, product pins, order events). Media leaves Socket.IO entirely.

---

## 8. Backend & data architecture

`apps/server` decomposed into clear domains (evolving today's handler split):

```
server/
├── gateway/        # Socket.IO + Redis adapter, auth middleware, presence
├── modules/
│   ├── streams/    # lifecycle, LiveKit token mint, viewer counts (Redis)
│   ├── catalog/    # products, variants, media
│   ├── inventory/  # per-dark-store stock, atomic reservation (Redis locks)
│   ├── orders/     # checkout, idempotency keys, Razorpay intents/webhooks
│   ├── delivery/   # rider assignment, live location, ETA, geofencing
│   ├── chat/       # messages, moderation, rate-limit (port chat.js)
│   ├── engage/     # polls, coupons, reactions, gifts (port polls/commerce.js)
│   └── identity/   # users, creators, roles (Clerk webhooks)
└── jobs/           # BullMQ: coupon expiry, order timeouts, payouts
```

**Data split:**
- **Postgres/Prisma (durable):** users, creators, products, variants, inventory ledger, orders, payments, deliveries, coupons (definition), streams (record).
- **Redis (ephemeral, fast):** `presence:{streamId}`, `viewers:{streamId}`, `cart:{userId}` (live cart), `lock:inventory:{sku}:{store}`, rate-limit buckets, active poll/coupon snapshots.

This fixes today's `sessionStore` being single-node in-memory ([store/sessionStore.js](backend/store/sessionStore.js)) and the boot-time `deleteMany` data wipe.

**Quick-commerce flow (the new spine):**
```
Buy tap → reserve inventory (Redis lock, nearest dark store by geo)
        → create Order (Postgres, status=pending, idempotency key)
        → Razorpay intent → UPI sheet → webhook confirms → status=paid
        → assign rider (delivery module) → status=out_for_delivery
        → live track (rider GPS → Socket.IO → buyer map) → delivered
```
Inventory reservation has a TTL; unpaid orders auto-release via a BullMQ job (mirrors the coupon-expiry pattern already in [commerce.js](backend/handlers/commerce.js)).

---

## 9. Design system — "LiveDrop DS"

### Foundations (in `packages/ui/tokens`, one JSON → web + native)
- **Color.** Evolve the current purple→pink gradient into a disciplined palette:
  - Brand: `--brand` magenta `#E1306C`-ish → `--brand-2` violet for gradients.
  - Surface: true-immersive **near-black** (`#0A0A0B`) for watch surfaces; clean light (`#FAFAFB`) for browse/checkout.
  - Semantic: `success` (delivery green), `warn` (low-stock amber), `live` (signature red), `price` (ink).
  - **Dual theme**: immersive dark for the stream, light for commerce/checkout — context-driven, not a global toggle.
- **Type.** Inter (already loaded). Scale: 12 / 14 / 16 / 20 / 24 / 32 / 44. Tight leading on headlines, generous on body. Tabular nums for prices/timers.
- **Space/Radius.** 4-pt grid. Radii: 8 (chips) / 16 (cards) / 24 (sheets) / full (pills, avatars).
- **Elevation.** Soft, colored shadows on light; glow + 1px white-alpha borders on dark glass.
- **Motion.** Spring presets: `snappy` (sheets), `bouncy` (reactions), `smooth` (page). Respect `prefers-reduced-motion`.
- **Haptics (native).** Light tick on buy, success thud on order placed, selection on reactions.

### Core components (built once per renderer, shared API)
Bottom sheet · Product pill · Live badge · Viewer pill · Reaction burst · Comment ticker · Coupon banner · Poll widget · Countdown ring · Stock meter · Price tag · Buy button · Cart drawer · Order tracker · Skeletons · Toasts · Avatar/host card.

> These are refined descendants of what exists: [FeaturedProductOverlay.tsx](src/components/FeaturedProductOverlay.tsx), [PollWidget.tsx](src/components/PollWidget.tsx), [ChatPanel.tsx](src/components/ChatPanel.tsx), [VideoPlayer.tsx](src/components/VideoPlayer.tsx).

---

## 10. UX — Mobile (the hero, TikTok-grade)

**Navigation:** bottom tabs — `Live` (FYP) · `Discover` · `[+] Go Live` · `Orders` · `Profile`. The Live tab is the default and the soul of the app.

### 10.1 Live FYP — vertical, swipe-between-streams
Full-bleed video. Swipe **up/down** = next/previous live stream (preloaded). All UI floats over the video as translucent glass.

```
┌───────────────────────────┐
│ ● LIVE   👁 1.2k      ✕    │  host avatar+name, live, viewers
│                           │
│      [ full-bleed         │
│        host video ]       │
│                        ❤  │  ← double-tap anywhere = like burst
│                        🎁  │     reactions fly up the right rail
│                        ↗  │
│  ┌─────────────────────┐  │
│  │ 🛍 Banarasi Saree   │  │  ← PINNED PRODUCT pill (host-controlled)
│  │ ₹2,499  ⏱ 04:58  ●12│  │     price · drop countdown · stock meter
│  │            [ Buy ▸ ]│  │     tap pill → product sheet; tap Buy → checkout
│  └─────────────────────┘  │
│  Priya: ekdum mast! 🔥    │  ← comment ticker (auto-scroll, fades)
│  Aarav bought a saree 🎉  │  ← purchase events inline (social proof)
│ ┌───────────────────────┐ │
│ │ Say something…   😀 ❤ │ │  ← input + quick Hinglish reactions
│ └───────────────────────┘ │
└───────────────────────────┘
```
Interactions: double-tap → heart burst (Reanimated) + haptic; long-press → mute/clarity; pull pill up → product **bottom sheet** (gallery, variants, size, "Buy now" / "Add to cart"); reactions and "X bought this" stream in via Socket.IO.

### 10.2 Product sheet → one-tap checkout
```
╭─ Banarasi Silk Saree ───────╮      ╭─ Checkout ──────────────╮
│ [▮▮ image gallery ▮▮]       │      │ Banarasi Saree   ₹2,499 │
│ ₹2,499  ̶₹̶3̶,̶9̶9̶9̶  38% off    │      │ Coupon DIWALI50  -₹400  │
│ Size:  S [M] L  XL          │  ▶   │ Delivery (12 min)  Free │
│ ● 12 left · 🔥 selling fast │      │ ─────────────────────── │
│ 🚚 Delivers in ~12 min      │      │ Pay ₹2,099  via UPI  ▸  │
│ [ Add to cart ] [ Buy now ]│      │  Apple/Google Pay · UPI │
╰─────────────────────────────╯      ╰─────────────────────────╯
```
Checkout is a sheet, never a page-leave — you stay "in" the live. UPI/Apple Pay/Google Pay sheet, address auto-from-geo, ETA from nearest dark store.

### 10.3 Live order tracking
```
┌───────────────────────────┐
│  Out for delivery · 6 min │
│   ┌─────────────────────┐ │
│   │   🗺  rider moving   │ │  live map, rider dot animating toward you
│   │        🛵 → 🏠       │ │
│   └─────────────────────┘ │
│  ●─────●─────●─────○      │  Packed · Picked · On the way · Delivered
│  Ravi · ⭐4.9 · 📞 Call   │
└───────────────────────────┘
```

### 10.4 Go Live (creator)
Camera preview → title/category/cover → **stage products** (queue items to pin) → schedule a **drop** (price + stock + countdown) → Go Live. In-stream creator HUD: pin product, launch poll/coupon, see sales + reaction analytics live (evolve [Host.tsx](src/pages/Host.tsx)).

---

## 11. UX — Web (responsive: discovery + theatre + studio)

**Discovery (`/`)** — SSR for SEO/shareability. Refined grid of live cards (evolve [StreamCard.tsx](src/components/StreamCard.tsx)): categories, "Live now", "Dropping soon", search. Light theme, editorial.

**Watch (`/watch/[id]`)** — desktop **theatre**:
```
┌──────────────────────────────────────┬───────────────────┐
│ ● LIVE  👁 1.2k                       │  [Chat] [Shop]    │
│                                       │ Priya: mast! 🔥   │
│        large host video               │ Aarav bought 🎉   │
│                                       │ …ticker…          │
│  ┌────────────────────────────────┐   │ ───────────────── │
│  │ 🛍 Banarasi ₹2,499 ⏱04:58 [Buy]│   │ ❤ 👍 🔥  [send…] │
│  └────────────────────────────────┘   │                   │
│  ❤  poll  coupon overlays             │  🛒 Cart (2)  ₹.. │
└──────────────────────────────────────┴───────────────────┘
```
On narrow screens this collapses to the **mobile immersive** layout (the watch page already uses full `h-screen` and hides the navbar — [App.tsx](src/App.tsx) / [Watch.tsx](src/pages/Watch.tsx) — so the responsive bones exist). Adds theatre mode, picture-in-picture, keyboard shortcuts.

**Creator Studio (`/studio`)** — web-only power surface: stream scheduling, product/drop manager, inventory by dark store, sales dashboards, moderation, payouts. This is where web beats mobile and earns its keep.

---

## 12. Cross-platform component strategy

**Recommendation: shared tokens + headless hooks + platform-native views** (NOT write-once).

- `packages/ui` = tokens + a tiny set of truly-shared primitives.
- `packages/ui-web` (Radix + Tailwind) and `packages/ui-native` (NativeWind + Reanimated) render platform-idiomatically.
- All behaviour lives in `packages/features` hooks, so a `ProductPill` on web and native share 100% of logic and 0% of markup — each is pixel-perfect for its platform.

**Why not Tamagui (write-once)?** It's excellent and would maximize code reuse, but for a TikTok-grade feel I'd rather hand-tune gestures/motion per platform than accept a shared abstraction's ceiling. *Alternative if team speed > polish:* adopt Tamagui for primitives and keep the headless hooks — the `features`/`core` split makes this swappable later without touching business logic.

---

## 13. Realtime event contract (typed, in `packages/realtime`)

One schema, imported by client and server — kills the stringly-typed drift that the audit flagged (e.g. `receive-reaction` vs `send-reaction`).

```ts
// packages/realtime/src/events.ts  (illustrative)
export const ServerEvents = {
  'viewer:count':       z.object({ streamId: z.string(), count: z.number() }),
  'chat:message':       MessageSchema,
  'reaction:burst':     z.object({ type: ReactionType, by: z.string() }),
  'product:pinned':     FeaturedProductSchema,
  'drop:countdown':     z.object({ productId: z.string(), endsAt: z.number(), stock: z.number() }),
  'poll:update':        PollSchema,
  'coupon:new':         CouponSchema,
  'order:update':       OrderStatusSchema,
  'delivery:location':  z.object({ orderId: z.string(), lat: z.number(), lng: z.number(), etaMin: z.number() }),
} as const

export const ClientEvents = {
  'room:join':     z.object({ streamId: z.string() }),
  'chat:send':     z.object({ streamId: z.string(), text: z.string().max(200) }),
  'reaction:send': z.object({ streamId: z.string(), type: ReactionType }),
  'poll:vote':     z.object({ streamId: z.string(), optionIndex: z.number().int().min(0) }),
  'checkout:buy':  z.object({ streamId: z.string(), items: z.array(CartLineSchema) }),
} as const
```
A typed `emit`/`on` wrapper makes invalid events a **compile error**, on both sides.

---

## 14. Security, auth, permissions

- **Auth:** Clerk sessions → short-lived JWT passed to Socket.IO handshake + tRPC. Phone/OTP primary (India), social secondary.
- **Roles:** `viewer`, `creator`, `rider`, `admin`. Creator-only events validated server-side (generalize today's `checkBroadcaster`).
- **Money safety:** all amounts in integer paise; orders carry **idempotency keys**; Razorpay webhooks verified by signature; inventory reserved under Redis locks to prevent oversell.
- **Abuse:** per-socket rate limits (chat/reactions), content moderation hook on messages, profanity/scam filters, report/ban.
- **Privacy:** address/geo encrypted at rest; rider sees coarse location until pickup.

---

## 15. Observability & performance budgets

- **Errors/traces:** Sentry (web+native+server), OTel spans across checkout and delivery.
- **Realtime SLOs:** chat p95 < 300ms; reaction round-trip < 200ms; join-to-first-frame < 2s (LiveKit).
- **Mobile budgets:** 60fps on the FYP scroll; cold start < 2.5s; JS bundle per route lazy-loaded; image/video preloading for the next stream in the feed.
- **Web budgets:** discovery LCP < 2.0s (SSR + edge), CLS < 0.05; watch interactive < 2.5s.

---

## 16. CI/CD & environments

- **Turborepo remote cache** (Vercel) → only changed packages rebuild/test.
- **Web:** Vercel (preview per PR, SSR/edge). **Server:** Fly.io/Railway (WebSockets + Redis colocated) or Render (current host) upgraded off free tier. **Mobile:** EAS Build + **EAS Update** (OTA JS pushes without store review).
- **Pipeline:** lint + typecheck + unit (`core`/`features`) on every PR; Playwright (web) + Maestro (native) e2e on the buy flow; preview deploy; migration gate for Prisma.
- **Envs:** `local` → `preview` → `staging` → `prod`, each with its own LiveKit project, Razorpay test/live keys, DB branch (Neon branching).

---

## 17. Phased roadmap

Sequenced by dependency, not calendar. Each phase ships something demoable.

> **Progress (delivered):**
> - ✅ **Phase 0** — Turborepo + pnpm; `apps/web`, `apps/server`; `@livedrop/core` (zod) + `@livedrop/config`. Green build/typecheck, no behaviour change.
> - ✅ **Phase 1** — `@livedrop/realtime` (typed event contract + `SocketProvider`/`useSocket`); `@livedrop/features` (headless `useChat`/`usePolls`/`useCoupons`); web consumes both via re-exports.
> - 🔄 **Phase 2 (in progress)** — `@livedrop/ui` design tokens + Tailwind v4 theme (adopted: LIVE badges → `bg-live`); `formatINR` in core (adopted across cards + cart). Next: Next.js re-platform + real auth.
> - 🔄 **Phase 3 (scaffolded)** — `@livedrop/streaming` (LiveKit `useStream` + token client); server `/api/livekit/token` mint route (501 until `LIVEKIT_*` set); web `STREAMING_BACKEND` flag (defaults `p2p`, non-breaking). All packages marked side-effect-free for tree-shaking. Next: swap Host/Watch onto LiveKit once creds are provisioned + RN client for mobile.

**Phase 0 — Monorepo scaffold (foundation).**
Turborepo + pnpm; move Vite app → `apps/web`, `backend/` → `apps/server`; extract `packages/core` (zod schemas from [types.ts](src/types.ts)) and `packages/config`. Green build + typecheck. *No behaviour change.*

**Phase 1 — Contracts + design tokens.**
`packages/realtime` typed event contract (server + web adopt it); `packages/ui` tokens; `packages/features` headless hooks (port `useChat/usePolls/useCoupons`). Web now consumes shared packages.

**Phase 2 — Web re-platform to Next.js + UX polish.**
SSR discovery + watch; refined LiveDrop DS components; responsive immersive watch. Real auth (Clerk) replaces localStorage.

**Phase 3 — Streaming on LiveKit.**
Replace P2P ([useWebRTC.ts](src/hooks/useWebRTC.ts)) with `packages/streaming`; server mints tokens; web watch + go-live on SFU. Kills the scale + NAT problems for good.

**Phase 4 — Commerce backbone.**
Postgres/Prisma + Redis; catalog, inventory, **real checkout + Razorpay**, orders. "Pay Now" becomes a real order. Socket.IO Redis adapter for scale.

**Phase 5 — Mobile app MVP (Expo).**
Live FYP, watch + chat + react, product sheet, checkout, orders tab. Shares `core/realtime/features/streaming` — only views are new. EAS builds + OTA.

**Phase 6 — Quick-commerce delivery.**
Dark-store inventory by geo, rider assignment, **live tracking map + ETA**, delivery state machine. The "10-minute" promise goes live.

**Phase 7 — Growth + creator economy.**
FYP ranking, scheduled drops, gifts/coins, creator studio analytics, replays (LiveKit egress → VOD), referrals.

---

## 18. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Big-bang refactor stalls product | Strangler pattern: web keeps working at every phase; ship per-phase |
| LiveKit/infra cost at scale | Start LiveKit Cloud, measure, self-host SFU when unit economics demand |
| Cross-platform UI divergence | Headless `features` hooks lock behaviour; only views differ |
| Inventory oversell on hot drops | Redis reservation locks + TTL release + DB constraint as backstop |
| Payment edge cases | Idempotency keys, signed webhooks, reconciliation job, test-mode e2e |
| Delivery realism (no fleet yet) | Phase 6 can run a **simulated rider** for demo; same contract as real |
| Mobile review latency | EAS Update OTA for JS; native binaries only when modules change |

---

## 19. Success metrics (North Star)

**North Star: GMV per live-hour.** Supporting: live→buy conversion, time-to-first-frame, p95 chat latency, order→doorstep median minutes, creator retention (D30), viewer session length.

---

## 20. Decisions I need from you

These genuinely fork the build — everything above assumes my default pick (in **bold**):

1. **Web framework:** migrate to **Next.js** (SSR/SEO, bigger lift) vs keep Vite SPA (faster, no SEO)?
2. **Streaming:** **LiveKit** self-host/cloud vs a managed closed SDK (Agora/100ms) vs defer and keep P2P for the demo?
3. **Data store:** **move to Postgres/Prisma** vs keep MongoDB (less migration, weaker for transactional commerce)?
4. **Cross-platform UI:** **tokens + platform-native views** (max polish) vs Tamagui write-once (max reuse)?
5. **Scope of "quick commerce" for v1:** real delivery integration vs **simulated rider** to prove the UX first?
6. **Codename:** keep **LiveDrop** or your own?

Tell me your picks (or just say "go with your defaults") and I'll start **Phase 0** — scaffold the Turborepo, move `web` + `server` in, and extract `packages/core` — without breaking the current app.
```
