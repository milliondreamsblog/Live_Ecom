import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SocketProvider } from '@livedrop/realtime';
import { CartProvider } from '@livedrop/features';
import { SOCKET_URL } from '../src/config';

/**
 * Root layout. Mounts the SAME shared SocketProvider the web app uses
 * (@livedrop/realtime) — only the URL injection is platform-specific.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SocketProvider url={SOCKET_URL}>
        <CartProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0A0A0B' },
            }}
          />
        </CartProvider>
      </SocketProvider>
    </SafeAreaProvider>
  );
}
