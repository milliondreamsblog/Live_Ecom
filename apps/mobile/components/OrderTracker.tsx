import { View, Text, StyleSheet } from 'react-native';
import { useDeliveryTracking } from '@livedrop/features';
import type { DeliveryStatus } from '@livedrop/core';
import { SOCKET_URL } from '../src/config';

const STEPS: DeliveryStatus[] = ['assigned', 'picked_up', 'en_route', 'delivered'];
const LABEL: Record<DeliveryStatus, string> = {
  assigned: 'Packed',
  picked_up: 'Picked up',
  en_route: 'On the way',
  delivered: 'Delivered',
};

export function OrderTracker({ orderId }: { orderId: string | null }) {
  const { delivery } = useDeliveryTracking({ apiBase: SOCKET_URL, orderId });
  if (!orderId || !delivery) return null;

  const activeIdx = STEPS.indexOf(delivery.status);
  const delivered = delivery.status === 'delivered';

  return (
    <View style={styles.card}>
      <Text style={styles.header}>
        🛵 {delivered ? 'Delivered 🎉' : `Arriving in ${delivery.etaMinutes} min`}
      </Text>
      <View style={styles.steps}>
        {STEPS.map((step, i) => (
          <View key={step} style={styles.step}>
            <View style={[styles.dot, i <= activeIdx && styles.dotActive]} />
            <Text style={styles.stepLabel}>{LABEL[step]}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.rider}>
        Rider <Text style={styles.riderName}>{delivery.riderName}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 12, width: 260 },
  header: { fontWeight: '800', color: '#7C3AED', fontSize: 13, marginBottom: 8 },
  steps: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  step: { alignItems: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB', marginBottom: 4 },
  dotActive: { backgroundColor: '#22C55E' },
  stepLabel: { fontSize: 9, color: '#6B7280', textAlign: 'center' },
  rider: { fontSize: 12, color: '#374151' },
  riderName: { fontWeight: '700', color: '#111' },
});
