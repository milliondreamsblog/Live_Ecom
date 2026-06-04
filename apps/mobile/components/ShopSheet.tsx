import { Modal, View, Text, FlatList, Image, Pressable, StyleSheet } from 'react-native';
import { useCart } from '@livedrop/features';
import { demoProducts, formatINR } from '@livedrop/core';

export function ShopSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { add } = useCart();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Shop 🛍️</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>
          <FlatList
            data={demoProducts}
            keyExtractor={(p) => String(p.id)}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Image source={{ uri: item.image }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>{formatINR(item.price)}</Text>
                </View>
                <Pressable style={styles.addBtn} onPress={() => add(item)}>
                  <Text style={styles.addText}>Add</Text>
                </Pressable>
              </View>
            )}
          />
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  name: { fontWeight: '600', color: '#111', fontSize: 14 },
  price: { color: '#6B7280', fontSize: 12 },
  addBtn: { backgroundColor: '#7C3AED', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
