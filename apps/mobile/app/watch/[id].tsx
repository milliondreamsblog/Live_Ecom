import { useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Link } from 'expo-router';
import { useChat } from '@livedrop/features';

/**
 * Watch screen — the SAME shared useChat hook the web app uses drives messages,
 * reactions and purchase notices. Only the views are native.
 */
export default function Watch() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const roomId = id ?? '';
  const { messages, sendMessage, sendReaction } = useChat(roomId);
  const [text, setText] = useState('');

  const send = () => {
    if (!text.trim()) return;
    sendMessage('Guest', text.trim());
    setText('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.header}>
        <Link href="/" style={styles.close}>
          ✕
        </Link>
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>● LIVE</Text>
        </View>
      </View>

      <FlatList
        style={styles.chat}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <Text style={styles.msg}>
            <Text style={styles.user}>{item.username}: </Text>
            {item.message}
          </Text>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Say something…</Text>}
      />

      <View style={styles.reactions}>
        <Pressable onPress={() => sendReaction('heart')} style={styles.reaction}>
          <Text style={styles.reactionText}>❤️</Text>
        </Pressable>
        <Pressable onPress={() => sendReaction('like')} style={styles.reaction}>
          <Text style={styles.reactionText}>👍</Text>
        </Pressable>
        <Pressable onPress={() => sendReaction('fire')} style={styles.reaction}>
          <Text style={styles.reactionText}>🔥</Text>
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Say something…"
          placeholderTextColor="#6B7280"
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable onPress={send} style={styles.sendBtn}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B', paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  close: { color: '#fff', fontSize: 20, padding: 4 },
  liveBadge: { backgroundColor: '#EF4444', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  chat: { flex: 1 },
  msg: { color: '#E5E7EB', fontSize: 14, marginBottom: 8 },
  user: { color: '#E1306C', fontWeight: '700' },
  empty: { color: '#6B7280', marginTop: 24, textAlign: 'center' },
  reactions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  reaction: { backgroundColor: '#161618', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  reactionText: { fontSize: 18 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, backgroundColor: '#161618', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, color: '#fff' },
  sendBtn: { backgroundColor: '#E1306C', borderRadius: 999, paddingHorizontal: 18, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: '700' },
});
