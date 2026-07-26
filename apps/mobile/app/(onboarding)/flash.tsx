import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { SkipLink } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import {
  AUTO_ADVANCE_MS,
  flashAudienceFromSeeking,
  flashRequired,
  flashSamplesFor,
  progressFor,
} from '@/lib/onboarding';

export default function FlashScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const audience = flashAudienceFromSeeking(profile?.seeking);
  const samples = useMemo(() => flashSamplesFor(audience), [audience]);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const progress = progressFor('flash');
  const sample = samples[index];
  const required = flashRequired(profile?.intent);

  useEffect(() => {
    setIndex(0);
  }, [audience]);

  useEffect(() => {
    api.logOnboardingEvent('flash', 'view', { required, audience }).catch(() => undefined);
  }, [required, audience]);

  const goNext = () => {
    playTick();
    setTimeout(() => router.push('/(onboarding)/looking-for'), AUTO_ADVANCE_MS);
  };

  const finish = async (skipped: boolean) => {
    setBusy(true);
    try {
      if (skipped) {
        await api.skipOnboardingGap('looking-for', 'flash');
      } else {
        await api.advanceOnboarding('looking-for', {});
        await api.clearProfileGap('flash').catch(() => undefined);
      }
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  const vote = async (liked: boolean) => {
    if (!sample || busy) return;
    setBusy(true);
    try {
      await api.saveFlashResponse(sample.id, liked);
      playTick();
      if (index >= samples.length - 1) {
        await finish(false);
        return;
      }
      setIndex((i) => i + 1);
    } finally {
      setBusy(false);
    }
  };

  if (!sample) return null;

  const audienceLabel =
    audience === 'women' ? 'women' : audience === 'men' ? 'men' : 'people you’re open to';

  return (
    <FlowShell
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
      footer={
        !required ? (
          <View style={styles.footer}>
            <SkipLink onPress={() => finish(true)} />
          </View>
        ) : undefined
      }
    >
      <Title>Your type</Title>
      <Body style={styles.body}>
        {required
          ? `Flash round for ${audienceLabel} — required for better matches. Tap ♥ or ✕.`
          : `Quick flash of ${audienceLabel} — tap ♥ or ✕ to seed better matches.`}
      </Body>
      <Body style={styles.meta}>
        {index + 1} / {samples.length}
      </Body>
      <Image source={{ uri: sample.url }} style={styles.photo} />
      <View style={styles.actions}>
        <Pressable style={[styles.btn, styles.no]} onPress={() => vote(false)} disabled={busy}>
          <Text style={styles.btnText}>✕</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.yes]} onPress={() => vote(true)} disabled={busy}>
          <Text style={styles.btnText}>♥</Text>
        </Pressable>
      </View>
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.sm, color: colors.textSecondary },
  meta: { color: colors.textSecondary, marginBottom: spacing.sm },
  photo: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: radii.lg,
    backgroundColor: colors.bg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  no: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
  yes: { backgroundColor: colors.roseSoft, borderWidth: 1, borderColor: colors.rose },
  btnText: { fontSize: 28, fontFamily: fonts.bodyBold, color: colors.text },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
});
