import { Modal, View, Text, FlatList, Image, Pressable, StyleSheet } from 'react-native';
import { useCart, useCheckout } from '@livedrop/features';
import { formatINR } from '@livedrop/core';
import { SOCKET_URL } from '../src/config';

export function CartSheet({ roomId, onOrder }: { roomId: string; onOrder: (orderId: string) => void }) {
  const { items, remove, clear, total, open, toggle } = useCart();
  const { checkout, status } = useCheckout({ apiBase: SOCKET_URL, roomId });

  const pay = async () => {
    const lines = items.map((i) => ({
      productId: i.id,
      name: i.name,
      priceRupees: i.price,
      quantity: i.q,
    }));
    const id = lines.length ? await checkout(lines) : null;
    if (id) onOrder(id);
    clear();
    toggle();
  };

  return (
    <Modal visible={open} animationType="slide" transparent onRequestClose={toggle}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Aapka Cart 🛒</Text>
            <Pressable onPress={toggle}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            style={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>Cart khali hai! 😢</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Image source={{ uri: item.image }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>
                    {formatINR(item.price)} × {item.q}
                  </Text>
                </View>
                <Pressable onPress={() => remove(item.id)}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatINR(total)}</Text>
            </View>
            <Pressable
              style={[styles.payBtn, items.length === 0 && styles.payBtnDisabled]}
              disabled={items.length === 0 || status === 'placing'}
              onPress={pay}
            >
              <Text style={styles.payText}>
                {status === 'placing' ? 'Placing…' : 'Pay Now 🚀'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: '#111' },
  close: { fontSize: 18, color: '#111' },
  list: { flexGrow: 0 },
  empty: { textAlign: 'center', color: '#9CA3AF', paddingVertical: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  name: { fontWeight: '600', color: '#111', fontSize: 14 },
  price: { color: '#6B7280', fontSize: 12 },
  remove: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
  footer: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { fontWeight: '700', fontSize: 16, color: '#111' },
  totalValue: { fontWeight: '800', fontSize: 16, color: '#111' },
  payBtn: { backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  payBtnDisabled: { opacity: 0.5 },
  payText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
