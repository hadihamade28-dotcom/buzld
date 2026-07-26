import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Body, Card, SubScreenHeader, Title } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';

const TIPS = [
  { emoji: '🏙️', title: 'Meet in public first', body: 'Stick to well-lit, busy places for your first in-person meetup.' },
  { emoji: '📳', title: 'Trust the buzz', body: 'Photos only reveal after Bluetooth confirms you are physically close.' },
  { emoji: '📱', title: 'Share your plans', body: 'Tell a friend where you are going and when you expect to be back.' },
  { emoji: '🛡️', title: 'Report concerns', body: 'Email support@vicino.app if someone makes you uncomfortable.' },
];

export default function SafetyScreen() {
  const router = useRouter();

  return (
    <FlowShell photo={false} scroll={false}>
      <SubScreenHeader title="Safety & privacy" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Title style={{ fontSize: 24 }}>Stay safe</Title>
        <Body style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
          Vicino is built for real-world proximity. Here is how we keep it safe.
        </Body>

        {TIPS.map((tip) => (
          <Card key={tip.title} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEmoji}>{tip.emoji}</Text>
              <Text style={styles.cardTitle}>{tip.title}</Text>
            </View>
            <Text style={styles.cardBody}>{tip.body}</Text>
          </Card>
        ))}

        <Text style={styles.footer}>
          Your interests and physical preferences are never shown on your profile — they only feed compatibility scoring.
        </Text>
      </ScrollView>
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.sm, backgroundColor: colors.bg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  cardEmoji: { fontSize: 20 },
  cardTitle: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  cardBody: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  footer: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
});
