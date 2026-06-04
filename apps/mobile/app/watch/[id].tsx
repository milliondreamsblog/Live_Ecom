import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useChat, useCart } from '@livedrop/features';
import { useSocket } from '@livedrop/realtime';
import type { St } from '@livedrop/core';
import { SOCKET_URL } from '../../src/config';
import { VideoPoster } from '../../components/VideoPoster';
import { CouponBanner } from '../../components/CouponBanner';
import { PollWidget } from '../../components/PollWidget';
import { FeaturedCard } from '../../components/FeaturedCard';
import { OrderTracker } from '../../components/OrderTracker';
import { CartSheet } from '../../components/CartSheet';
import { ShopSheet } from '../../components/ShopSheet';

export default function Watch() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = id ?? '';
  const { socket } = useSocket();
  const { messages, sendMessage, sendReaction } = useChat(roomId);
  const { count, toggle } = useCart();

  const [streamInfo, setStreamInfo] = useState<St | null>(null);
  const [views, setViews] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!roomId) return;
    fetch(`${SOCKET_URL}/api/streams/${roomId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: St | null) => setStreamInfo(d))
      .catch(() => {});
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;
    const onViews = (c: number) => setViews(c);
    socket.on('viewer-count', onViews);
    return () => {
      socket.off('viewer-count', onViews);
    };
  }, [socket]);

  const send = () => {
    if (!text.trim()) return;
    sendMessage('Guest', text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <VideoPoster thumbnailUrl={streamInfo?.thumbnailUrl} />

      <View style={[styles.hud, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Text style={styles.icon}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {streamInfo?.title ?? 'Live Stream'}
          </Text>
          <Text style={styles.host}>{streamInfo?.hostName ?? ''}</Text>
        </View>
        <View style={styles.live}>
          <Text style={styles.liveText}>● LIVE</Text>
        </View>
        <View style={styles.viewers}>
          <Text style={styles.viewersText}>👁 {views}</Text>
        </View>
      </View>

      <View style={[styles.overlays, { top: insets.top + 64 }]}>
        <CouponBanner roomId={roomId} />
        <PollWidget roomId={roomId} />
      </View>

      <View style={styles.bottomLeft}>
        <FeaturedCard roomId={roomId} />
        <OrderTracker orderId={orderId} />
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
        <FlatList
          style={styles.chat}
          data={messages.slice(-6)}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <Text style={styles.msg}>
              <Text style={styles.user}>{item.username}: </Text>
              {item.message}
            </Text>
          )}
        />

        <View style={styles.actions}>
          <Pressable onPress={() => sendReaction('heart')} style={styles.reaction}>
            <Text style={styles.reactionText}>❤️</Text>
          </Pressable>
          <Pressable onPress={() => sendReaction('fire')} style={styles.reaction}>
            <Text style={styles.reactionText}>🔥</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setShopOpen(true)} style={styles.pill}>
            <Text style={styles.pillText}>🛍️ Shop</Text>
          </Pressable>
          <Pressable onPress={toggle} style={styles.pill}>
            <Text style={styles.pillText}>🛒 {count > 0 ? count : ''}</Text>
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Say something…"
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable onPress={send} style={styles.sendBtn}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </View>

      <CartSheet roomId={roomId} onOrder={setOrderId} />
      <ShopSheet visible={shopOpen} onClose={() => setShopOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  hud: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, zIndex: 30 },
  iconBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999 },
  icon: { color: '#fff', fontSize: 16 },
  title: { color: '#fff', fontWeight: '700', fontSize: 15 },
  host: { color: '#D1D5DB', fontSize: 12 },
  live: { backgroundColor: '#EF4444', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  viewers: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  viewersText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  overlays: { position: 'absolute', right: 12, alignItems: 'flex-end', gap: 8, zIndex: 20 },
  bottomLeft: { position: 'absolute', bottom: 180, left: 12, gap: 8, zIndex: 20 },
  bottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 12, gap: 8, zIndex: 10 },
  chat: { maxHeight: 130 },
  msg: { color: '#E5E7EB', fontSize: 13, marginBottom: 4 },
  user: { color: '#E1306C', fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reaction: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  reactionText: { fontSize: 16 },
  pill: { backgroundColor: '#7C3AED', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, color: '#fff' },
  sendBtn: { backgroundColor: '#E1306C', borderRadius: 999, paddingHorizontal: 18, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
});
