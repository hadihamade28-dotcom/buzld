import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SkipLink } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, Button, Chip, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import {
  AUTO_ADVANCE_MS,
  flashAudienceFromSeeking,
  lookingForTagsFor,
  MAX_LOOKING_FOR_TAGS,
  progressFor,
} from '@/lib/onboarding';

export default function LookingForScreen() {
  const { profile, prefs, refresh } = useAuth();
  const router = useRouter();
  const audience = flashAudienceFromSeeking(profile?.seeking);
  const catalog = useMemo(() => lookingForTagsFor(audience), [audience]);
  const [selected, setSelected] = useState<string[]>(() =>
    (prefs?.looking_for_tags ?? []).filter((t) => catalog.includes(t)),
  );
  const [busy, setBusy] = useState(false);
  const progress = progressFor('looking-for');

  useEffect(() => {
    setSelected((prev) => prev.filter((t) => catalog.includes(t)));
  }, [catalog]);

  useEffect(() => {
    api.logOnboardingEvent('looking-for', 'view', { audience }).catch(() => undefined);
  }, [audience]);

  const toggle = (tag: string) => {
    setSelected((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_LOOKING_FOR_TAGS) return prev;
      return [...prev, tag];
    });
  };

  const goNext = () => {
    playTick();
    setTimeout(() => router.push('/(onboarding)/height-range'), AUTO_ADVANCE_MS);
  };

  const next = async () => {
    setBusy(true);
    try {
      await api.setPrefs({ looking_for_tags: selected });
      await api.advanceOnboarding('height-range', {});
      if (selected.length) await api.clearProfileGap('looking_for').catch(() => undefined);
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    setBusy(true);
    try {
      await api.skipOnboardingGap('height-range', 'looking_for');
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  const who =
    audience === 'women' ? 'in women' : audience === 'men' ? 'in men' : 'in people you meet';

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
      <Title>Anything you notice?</Title>
      <Body style={styles.body}>
        Pick up to {MAX_LOOKING_FOR_TAGS} traits you notice {who}.
      </Body>
      <View style={styles.chipRow}>
        {catalog.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            active={selected.includes(tag)}
            onPress={() => toggle(tag)}
          />
        ))}
      </View>
      <Body style={styles.meta}>
        {selected.length}/{MAX_LOOKING_FOR_TAGS}
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
