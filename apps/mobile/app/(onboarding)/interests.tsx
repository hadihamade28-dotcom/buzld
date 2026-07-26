import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SkipLink } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, Button, Chip, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, progressFor } from '@/lib/onboarding';
import { INTEREST_CATALOG } from '@/lib/types';

export default function InterestsScreen() {
  const { interests: existing, refresh } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(existing);
  const [busy, setBusy] = useState(false);
  const progress = progressFor('interests');

  useEffect(() => {
    api.logOnboardingEvent('interests', 'view').catch(() => undefined);
  }, []);

  const toggle = (tag: string) => {
    setSelected((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 10) return prev;
      return [...prev, tag];
    });
  };

  const goNext = () => {
    playTick();
    setTimeout(() => router.push('/(onboarding)/lifestyle'), AUTO_ADVANCE_MS);
  };

  const next = async () => {
    if (selected.length < 3) return;
    setBusy(true);
    try {
      await api.setInterests(selected);
      await api.advanceOnboarding('lifestyle', {});
      await api.clearProfileGap('interests').catch(() => undefined);
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    setBusy(true);
    try {
      await api.skipOnboardingGap('lifestyle', 'interests');
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
      footer={
        <View style={styles.footer}>
          <Button
            label="Continue"
            onPress={next}
            loading={busy}
            disabled={selected.length < 3}
            large
          />
          <SkipLink onPress={skip} />
        </View>
      }
    >
      <Title>Interests</Title>
      <Body style={styles.body}>Tap 3–10. We’ll use these to find people you click with.</Body>
      <View style={styles.chipRow}>
        {INTEREST_CATALOG.map((tag) => (
          <Chip key={tag} label={tag} active={selected.includes(tag)} onPress={() => toggle(tag)} />
        ))}
      </View>
      <Text style={styles.counter}>{selected.length} selected</Text>
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  counter: {
    marginTop: spacing.md,
    textAlign: 'center',
    fontFamily: fonts.bodyMedium,
    color: colors.textSecondary,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
});
