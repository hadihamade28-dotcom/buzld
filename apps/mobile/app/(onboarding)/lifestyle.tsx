import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ChoiceGrid, SkipLink } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, OnboardingProgress, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, progressFor } from '@/lib/onboarding';
import { LIFESTYLE_CARDS, type Lifestyle } from '@/lib/types';

export default function LifestyleScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const initial = useMemo(() => ({ ...(profile?.lifestyle ?? {}) }), [profile?.lifestyle]);
  const [answers, setAnswers] = useState<Lifestyle>(initial);
  const [cardIndex, setCardIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const progress = progressFor('lifestyle');
  const card = LIFESTYLE_CARDS[cardIndex];

  useEffect(() => {
    api.logOnboardingEvent('lifestyle', 'view').catch(() => undefined);
  }, []);

  const finish = async (lifestyle: Lifestyle, skipped: boolean) => {
    setBusy(true);
    try {
      if (skipped) {
        await api.skipOnboardingGap('flash', 'lifestyle');
      } else {
        await api.advanceOnboarding('flash', { lifestyle });
        await api.clearProfileGap('lifestyle').catch(() => undefined);
      }
      await refresh();
      playTick();
      setTimeout(() => router.push('/(onboarding)/flash'), AUTO_ADVANCE_MS);
    } finally {
      setBusy(false);
    }
  };

  const choose = async (yes: boolean) => {
    if (!card || busy) return;
    const nextAnswers = { ...answers, [card.key]: yes };
    setAnswers(nextAnswers);
    playTick();
    if (cardIndex >= LIFESTYLE_CARDS.length - 1) {
      await finish(nextAnswers, false);
      return;
    }
    setTimeout(() => setCardIndex((i) => i + 1), AUTO_ADVANCE_MS);
  };

  if (!card) return null;

  return (
    <FlowShell
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
      footer={
        <View style={styles.footer}>
          <SkipLink onPress={() => finish(answers, true)} />
        </View>
      }
    >
      <Body style={styles.meta}>
        {cardIndex + 1} of {LIFESTYLE_CARDS.length}
      </Body>
      <Title>{card.label}</Title>
      <Body style={styles.body}>Quick yes / no — shapes lifestyle compatibility.</Body>
      <ChoiceGrid
        options={[
          { id: 'yes', label: card.yes },
          { id: 'no', label: card.no },
        ]}
        onChange={(id) => choose(id === 'yes')}
      />
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  meta: { color: colors.textSecondary, marginBottom: spacing.xs },
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
