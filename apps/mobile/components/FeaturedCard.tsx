import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useFeaturedProduct, useCart } from '@livedrop/features';
import { formatINR } from '@livedrop/core';

export function FeaturedCard({ roomId }: { roomId: string }) {
  const { featured, dismiss } = useFeaturedProduct(roomId);
  const { add } = useCart();

  if (!featured) return null;

  return (
    <View style={styles.card}>
      <Image source={{ uri: featured.image }} style={styles.img} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {featured.name}
        </Text>
        <Text style={styles.price}>{formatINR(featured.price)}</Text>
        <Pressable
          style={styles.btn}
          onPress={() => {
            add(featured);
            dismiss();
          }}
        >
          <Text style={styles.btnText}>Cart mein add karo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 10, backgroundColor: '#fff', borderRadius: 16, padding: 10, width: 260 },
  img: { width: 64, height: 64, borderRadius: 12 },
  body: { flex: 1, justifyContent: 'space-between' },
  name: { fontWeight: '700', color: '#111', fontSize: 14 },
  price: { fontWeight: '800', color: '#111', fontSize: 16 },
  btn: { backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
