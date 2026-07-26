import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SkipLink } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, Button, Chip, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, MAX_STYLE_TAGS, progressFor } from '@/lib/onboarding';
import { STYLE_TAGS } from '@/lib/types';

export default function StyleScreen() {
  const { prefs, refresh } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(prefs?.style_tags ?? []);
  const [busy, setBusy] = useState(false);
  const progress = progressFor('style');

  useEffect(() => {
    api.logOnboardingEvent('style', 'view').catch(() => undefined);
  }, []);

  const toggle = (tag: string) => {
    setSelected((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_STYLE_TAGS) return prev;
      return [...prev, tag];
    });
  };

  const goNext = () => {
    playTick();
    setTimeout(() => router.push('/(onboarding)/permissions'), AUTO_ADVANCE_MS);
  };

  const next = async () => {
    setBusy(true);
    try {
      await api.setPrefs({ style_tags: selected });
      await api.advanceOnboarding('permissions', {});
      if (selected.length) await api.clearProfileGap('style').catch(() => undefined);
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    setBusy(true);
    try {
      await api.skipOnboardingGap('permissions', 'style');
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
            disabled={!selected.length}
            large
          />
          <SkipLink onPress={skip} />
        </View>
      }
    >
      <Title>Your look</Title>
      <Body style={styles.body}>
        How would friends describe you? Pick up to {MAX_STYLE_TAGS} — helps the right people find you.
      </Body>
      <View style={styles.chipRow}>
        {STYLE_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            active={selected.includes(tag)}
            onPress={() => toggle(tag)}
          />
        ))}
      </View>
      <Body style={styles.meta}>
        {selected.length}/{MAX_STYLE_TAGS}
      </Body>
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  meta: { marginTop: spacing.md, color: colors.textSecondary, fontFamily: fonts.bodyMedium },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
});
