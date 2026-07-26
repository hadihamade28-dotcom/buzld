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
import { INTENT_OPTIONS, type Intent } from '@/lib/types';

export default function IntentScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const [value, setValue] = useState<Intent | null>(profile?.intent ?? null);
  const [busy, setBusy] = useState(false);
  const progress = progressFor('intent');

  useEffect(() => {
    api.logOnboardingEvent('intent', 'view').catch(() => undefined);
  }, []);

  const choose = async (id: string) => {
    if (busy) return;
    const intent = id as Intent;
    setValue(intent);
    setBusy(true);
    try {
      await api.advanceOnboarding('photos', { intent });
      await refresh();
      playTick();
      setTimeout(() => router.push('/(onboarding)/photos'), AUTO_ADVANCE_MS);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
    >
      <Title>What are you here for?</Title>
      <Body style={styles.body}>This shapes who we show you first — you can change it later.</Body>
      <ChoiceGrid
        options={INTENT_OPTIONS.map((o) => ({ id: o.id, label: o.label, hint: o.hint }))}
        value={value}
        onChange={choose}
      />
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
});
