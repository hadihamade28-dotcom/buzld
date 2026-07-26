import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceGrid } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, OnboardingProgress, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, progressFor } from '@/lib/onboarding';
import type { Gender } from '@/lib/types';

const OPTIONS: { id: Gender; label: string }[] = [
  { id: 'woman', label: 'Woman' },
  { id: 'man', label: 'Man' },
  { id: 'nonbinary', label: 'Non-binary' },
  { id: 'other', label: 'Other' },
];

export default function GenderScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const [value, setValue] = useState<Gender | null>(profile?.gender ?? null);
  const [busy, setBusy] = useState(false);
  const progress = progressFor('gender');

  useEffect(() => {
    api.logOnboardingEvent('gender', 'view').catch(() => undefined);
  }, []);

  const choose = async (id: string) => {
    if (busy) return;
    const gender = id as Gender;
    setValue(gender);
    setBusy(true);
    try {
      await api.advanceOnboarding('seeking', { gender });
      await refresh();
      playTick();
      setTimeout(() => router.push('/(onboarding)/seeking'), AUTO_ADVANCE_MS);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
    >
      <Title>I am</Title>
      <Body style={styles.body}>One tap — we’ll move on right away.</Body>
      <ChoiceGrid options={OPTIONS} value={value} onChange={choose} />
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
});
