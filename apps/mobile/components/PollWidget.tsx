import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePolls } from '@livedrop/features';

export function PollWidget({ roomId }: { roomId: string }) {
  const { currentPoll, votePoll } = usePolls(roomId);
  const [voted, setVoted] = useState<number | null>(null);

  if (!currentPoll) return null;
  const total = currentPoll.options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{currentPoll.question}</Text>
      {currentPoll.options.map((opt, i) => {
        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
        if (voted !== null) {
          return (
            <View key={i} style={styles.resultRow}>
              <View style={[styles.bar, { width: `${pct}%` }]} />
              <Text style={styles.optText}>
                {opt.text} · {pct}%
              </Text>
            </View>
          );
        }
        return (
          <Pressable
            key={i}
            style={styles.opt}
            onPress={() => {
              setVoted(i);
              votePoll(i);
            }}
          >
            <Text style={styles.optText}>{opt.text}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, padding: 12, gap: 6, width: 240 },
  question: { fontWeight: '700', color: '#111', fontSize: 13, marginBottom: 2 },
  opt: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  resultRow: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, justifyContent: 'center', overflow: 'hidden' },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#DBEAFE' },
  optText: { color: '#111', fontSize: 13, fontWeight: '500' },
});
