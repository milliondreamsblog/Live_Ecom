import { View, Image, Text, StyleSheet } from 'react-native';

/**
 * Stream backdrop. Real video playback needs the LiveKit RN SDK (creds + a dev
 * build) or react-native-webrtc; until then we show the blurred thumbnail and
 * a hint. This is the documented native-blocked piece.
 */
export function VideoPoster({ thumbnailUrl }: { thumbnailUrl?: string }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          style={StyleSheet.absoluteFill}
          blurRadius={6}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.fallback]} />
      )}
      <View style={styles.hint}>
        <Text style={styles.hintText}>📹 Connect LiveKit to enable live video</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: '#161618' },
  hint: { position: 'absolute', top: '46%', alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  hintText: { color: '#D1D5DB', fontSize: 12 },
});
