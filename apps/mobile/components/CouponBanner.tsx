import { View, Text, StyleSheet } from 'react-native';
import { useCoupons } from '@livedrop/features';

export function CouponBanner({ roomId }: { roomId: string }) {
  const { coupon } = useCoupons(roomId);
  if (!coupon) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        🎟 {coupon.code} — {coupon.discount}% OFF
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#F59E0B', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'center' },
  text: { color: '#1F2937', fontWeight: '800', fontSize: 12 },
});
