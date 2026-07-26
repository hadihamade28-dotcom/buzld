import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { SkipLink } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, FLASH_SAMPLES, progressFor } from '@/lib/onboarding';

export default function FlashScreen() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const progress = progressFor('flash');
  const sample = FLASH_SAMPLES[index];

  useEffect(() => {
    api.logOnboardingEvent('flash', 'view').catch(() => undefined);
  }, []);

  const finish = async (skipped: boolean) => {
    setBusy(true);
    try {
      if (skipped) {
        await api.skipOnboardingGap('height-prompt', 'flash');
      } else {
        await api.advanceOnboarding('height-prompt', {});
        await api.clearProfileGap('flash').catch(() => undefined);
      }
      await refresh();
      playTick();
      setTimeout(() => router.push('/(onboarding)/height-prompt'), AUTO_ADVANCE_MS);
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
      if (index >= FLASH_SAMPLES.length - 1) {
        await finish(false);
        return;
      }
      setIndex((i) => i + 1);
    } finally {
      setBusy(false);
    }
  };

  if (!sample) return null;

  return (
    <FlowShell
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
      footer={
        <View style={styles.footer}>
          <SkipLink onPress={() => finish(true)} />
        </View>
      }
    >
      <Title>Your type</Title>
      <Body style={styles.body}>
        Quick flash round — tap ♥ or ✕. Seeds better matches before your first real buzz.
      </Body>
      <Body style={styles.meta}>
        {index + 1} / {FLASH_SAMPLES.length}
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
