import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ChoiceGrid } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, OnboardingProgress, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, progressFor } from '@/lib/onboarding';
import type { Seeking } from '@/lib/types';

const OPTIONS: { id: Seeking; label: string }[] = [
  { id: 'woman', label: 'Women' },
  { id: 'man', label: 'Men' },
  { id: 'nonbinary', label: 'Non-binary people' },
  { id: 'everyone', label: 'Everyone' },
];

export default function SeekingScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const [value, setValue] = useState<Seeking | null>(profile?.seeking ?? null);
  const [busy, setBusy] = useState(false);
  const progress = progressFor('seeking');

  useEffect(() => {
    api.logOnboardingEvent('seeking', 'view').catch(() => undefined);
  }, []);

  const choose = async (id: string) => {
    if (busy) return;
    const seeking = id as Seeking;
    setValue(seeking);
    setBusy(true);
    try {
      await api.advanceOnboarding('intent', { seeking });
      await refresh();
      playTick();
      setTimeout(() => router.push('/(onboarding)/intent'), AUTO_ADVANCE_MS);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
    >
      <Title>I’m open to</Title>
      <Body style={styles.body}>We’ll only buzz people who want to meet you too.</Body>
      <ChoiceGrid options={OPTIONS} value={value} onChange={choose} />
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
});
