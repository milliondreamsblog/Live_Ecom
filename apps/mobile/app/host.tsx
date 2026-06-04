import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useHostControls, usePolls } from '@livedrop/features';
import { demoProducts, formatINR } from '@livedrop/core';

export default function Host() {
  const insets = useSafeAreaInsets();
  // Stable room id for this session.
  const [roomId] = useState(() => `room-${Date.now()}`);
  const { goLive, endStream, featureProduct, sendCoupon } = useHostControls(roomId);
  const { currentPoll, createPoll, endPoll } = usePolls(roomId);

  const [live, setLive] = useState(false);
  const [title, setTitle] = useState('🎉 Dhamakedaar Live Sale!');
  const [category, setCategory] = useState('Fashion');
  const [hostName, setHostName] = useState('Host');

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('20');
  const [question, setQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');

  const start = () => {
    if (!title.trim()) return;
    goLive({ title: title.trim(), category, hostName: hostName.trim() || 'Host' });
    setLive(true);
  };

  const stop = () => {
    endStream();
    setLive(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, gap: 16 }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <View style={[styles.badge, live ? styles.badgeLive : styles.badgeOff]}>
          <Text style={styles.badgeText}>{live ? '● LIVE' : 'OFFLINE'}</Text>
        </View>
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewText}>📷 Camera preview needs expo-camera + LiveKit publish</Text>
      </View>

      {!live ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ready to go live?</Text>
          <Text style={styles.label}>Stream title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#6B7280" />
          <Text style={styles.label}>Category</Text>
          <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="Category" placeholderTextColor="#6B7280" />
          <Text style={styles.label}>Host name</Text>
          <TextInput style={styles.input} value={hostName} onChangeText={setHostName} placeholder="Your name" placeholderTextColor="#6B7280" />
          <Pressable style={styles.goLive} onPress={start}>
            <Text style={styles.goLiveText}>🚀 Go Live</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Share</Text>
            <Text style={styles.share}>Viewer link: /watch/{roomId}</Text>
            <Pressable style={styles.endBtn} onPress={stop}>
              <Text style={styles.endText}>End Stream</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Feature a product</Text>
            {demoProducts.slice(0, 5).map((p) => (
              <View key={p.id} style={styles.prodRow}>
                <Image source={{ uri: p.image }} style={styles.prodImg} />
                <Text style={styles.prodName} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.prodPrice}>{formatINR(p.price)}</Text>
                <Pressable style={styles.featureBtn} onPress={() => featureProduct(p)}>
                  <Text style={styles.featureText}>Feature</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Flash coupon</Text>
            <View style={styles.inlineRow}>
              <TextInput style={[styles.input, { flex: 2 }]} value={code} onChangeText={(t) => setCode(t.toUpperCase())} placeholder="CODE" placeholderTextColor="#6B7280" />
              <TextInput style={[styles.input, { flex: 1 }]} value={discount} onChangeText={setDiscount} keyboardType="number-pad" placeholder="%" placeholderTextColor="#6B7280" />
            </View>
            <Pressable
              style={styles.actionBtn}
              onPress={() => {
                if (code) sendCoupon(code, Number(discount) || 10, 60);
                setCode('');
              }}
            >
              <Text style={styles.actionText}>Send coupon</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Live poll</Text>
            {currentPoll ? (
              <Pressable style={styles.endBtn} onPress={endPoll}>
                <Text style={styles.endText}>End poll</Text>
              </Pressable>
            ) : (
              <>
                <TextInput style={styles.input} value={question} onChangeText={setQuestion} placeholder="Question" placeholderTextColor="#6B7280" />
                <TextInput style={styles.input} value={optA} onChangeText={setOptA} placeholder="Option 1" placeholderTextColor="#6B7280" />
                <TextInput style={styles.input} value={optB} onChangeText={setOptB} placeholder="Option 2" placeholderTextColor="#6B7280" />
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => {
                    const opts = [optA, optB].filter((o) => o.trim());
                    if (question.trim() && opts.length >= 2) {
                      createPoll(question.trim(), opts);
                      setQuestion('');
                      setOptA('');
                      setOptB('');
                    }
                  }}
                >
                  <Text style={styles.actionText}>Launch poll</Text>
                </Pressable>
              </>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0B' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { color: '#fff', fontSize: 16 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeLive: { backgroundColor: '#EF4444' },
  badgeOff: { backgroundColor: '#374151' },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  preview: { height: 180, backgroundColor: '#161618', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  previewText: { color: '#6B7280', fontSize: 12, paddingHorizontal: 24, textAlign: 'center' },
  card: { backgroundColor: '#161618', borderRadius: 16, padding: 14, gap: 8 },
  cardTitle: { color: '#fff', fontWeight: '800', fontSize: 15, marginBottom: 4 },
  label: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  input: { backgroundColor: '#0A0A0B', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', borderWidth: 1, borderColor: '#27272A' },
  inlineRow: { flexDirection: 'row', gap: 8 },
  goLive: { backgroundColor: '#E1306C', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  goLiveText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  share: { color: '#D1D5DB', fontSize: 12 },
  endBtn: { backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  endText: { color: '#EF4444', fontWeight: '700' },
  prodRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prodImg: { width: 36, height: 36, borderRadius: 8 },
  prodName: { color: '#fff', flex: 1, fontSize: 13 },
  prodPrice: { color: '#9CA3AF', fontSize: 12 },
  featureBtn: { backgroundColor: '#F59E0B', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  featureText: { color: '#1F2937', fontWeight: '700', fontSize: 12 },
  actionBtn: { backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700' },
});
