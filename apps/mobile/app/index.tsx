import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import type { St } from '@livedrop/core';
import { SOCKET_URL } from '../src/config';

/** Live feed — same /api/streams the web Home uses, rendered native. */
export default function LiveFeed() {
  const insets = useSafeAreaInsets();
  const [streams, setStreams] = useState<St[]>([]);

  useEffect(() => {
    const load = () => {
      fetch(`${SOCKET_URL}/api/streams`)
        .then((r) => r.json())
        .then((data: St[]) => setStreams(data.filter((s) => s.isLive)))
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>
        Live <Text style={styles.brand}>now</Text>
      </Text>
      <FlatList
        data={streams}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={`/watch/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>● LIVE</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.cardMeta}>
                {item.hostName} · {item.viewers} watching
              </Text>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No live streams right now.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B', paddingHorizontal: 16 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 16 },
  brand: { color: '#E1306C' },
  list: { gap: 12, paddingBottom: 32 },
  card: { backgroundColor: '#161618', borderRadius: 16, padding: 16 },
  liveBadge: { alignSelf: 'flex-start', backgroundColor: '#EF4444', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 8 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardMeta: { color: '#9CA3AF', fontSize: 13, marginTop: 4 },
  empty: { color: '#6B7280', textAlign: 'center', marginTop: 48 },
});
