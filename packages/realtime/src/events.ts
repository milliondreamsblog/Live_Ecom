import type { Socket } from 'socket.io-client';
import type { Message, PollData, CouponData, Product } from '@livedrop/core';

/**
 * The realtime event contract — one typed source of truth for every
 * Socket.IO event, shared by web (and later mobile + server). Payload types
 * reference @livedrop/core schemas so they can't drift from the domain model.
 *
 * NOTE: these are `type` aliases (not interfaces) on purpose — socket.io's
 * generics require the maps to be assignable to Record<string, fn>, which
 * interfaces are not.
 */

/** Server -> client (events the client listens for). */
export type ServerEvents = {
  'viewer-count': (count: number) => void;
  'receive-message': (message: Message) => void;
  'receive-reaction': (type: string) => void;
  'stream-started': (stream: {
    id: string;
    title: string;
    hostName: string;
    category: string;
    roomId: string;
  }) => void;
  'stream-ended': (data: { roomId: string }) => void;
  'new-coupon': (coupon: CouponData) => void;
  'current-coupon': (coupon: CouponData) => void;
  'coupon-expired': () => void;
  'new-poll': (poll: PollData) => void;
  'current-poll': (poll: PollData) => void;
  'update-poll-results': (poll: PollData) => void;
  'poll-ended': () => void;
  'featured-product': (product: Product) => void;
  'product-purchased': (payload: {
    username: string;
    product: { id: number; name: string; price: number };
  }) => void;
  'auth-error': (error: { message: string }) => void;
  // WebRTC signaling — loosely typed pending the LiveKit migration (plan.md Phase 3).
  broadcaster: () => void;
  watcher: (socketId: string) => void;
  offer: (socketId: string, description: unknown) => void;
  answer: (socketId: string, description: unknown) => void;
  candidate: (socketId: string, candidate: unknown) => void;
  disconnectPeer: (socketId: string) => void;
};

/** Client -> server (events the client emits). */
export type ClientEvents = {
  'join-room': (roomId: string) => void;
  'start-stream': (data: {
    roomId: string;
    title: string;
    category: string;
    hostName: string;
  }) => void;
  'end-stream': (data: { roomId: string }) => void;
  'send-message': (data: { roomId: string; username: string; message: string }) => void;
  'send-reaction': (data: { roomId: string; type: string }) => void;
  'send-coupon': (data: {
    roomId: string;
    code: string;
    discount: number;
    duration: number;
  }) => void;
  'feature-product': (data: { roomId: string; product: Product }) => void;
  'product-purchased': (data: {
    roomId: string;
    username: string;
    product: { id: number; name: string; price: number };
  }) => void;
  'create-poll': (data: { roomId: string; question: string; options: string[] }) => void;
  'vote-poll': (data: { roomId: string; optionIndex: number }) => void;
  'end-poll': (data: { roomId: string }) => void;
  // WebRTC signaling.
  broadcaster: (roomId: string) => void;
  watcher: (roomId: string) => void;
  offer: (socketId: string, description: unknown) => void;
  answer: (socketId: string, description: unknown) => void;
  candidate: (socketId: string, candidate: unknown) => void;
};

/** A fully-typed Socket.IO client socket for the LiveDrop contract. */
export type AppSocket = Socket<ServerEvents, ClientEvents>;
