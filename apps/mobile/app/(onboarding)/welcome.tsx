import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { BrandMark, Button, Eyebrow, Title } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';

const STEPS = [
  { emoji: '📍', title: 'Find nearby', desc: 'See compatible people around you in real time' },
  { emoji: '📳', title: 'Feel the buzz', desc: 'Your phones vibrate when you are close' },
  { emoji: '♥', title: 'Match & chat', desc: 'Like each other to unlock messaging' },
];

export default function WelcomeOnboarding() {
  const router = useRouter();
  return (
    <FlowShell
      header={<BrandMark large light />}
      footer={
        <View style={styles.footer}>
          <Button label="Create my profile" onPress={() => router.push('/(onboarding)/profile')} large />
        </View>
      }
    >
      <Eyebrow>How it works</Eyebrow>
      <Title style={styles.title}>You're almost in</Title>
      <Text style={styles.subtitle}>
        Three steps to start meeting people actually near you.
      </Text>

      <View style={styles.steps}>
        {STEPS.map((s, i) => (
          <View key={s.title} style={styles.step}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{s.title}</Text>
              <Text style={styles.stepDesc}>{s.desc}</Text>
            </View>
            <Text style={styles.stepEmoji}>{s.emoji}</Text>
          </View>
        ))}
      </View>
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.sm },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  steps: { gap: spacing.sm },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bg,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 14 },
  stepText: { flex: 1 },
  stepTitle: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  stepDesc: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 13, marginTop: 3, lineHeight: 18 },
  stepEmoji: { fontSize: 22 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
