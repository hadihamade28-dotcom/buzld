import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SkipLink } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, Button, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, progressFor } from '@/lib/onboarding';

export default function HeightPromptScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const [height, setHeight] = useState(profile?.height_cm ?? 170);
  const [prompt, setPrompt] = useState(profile?.prompt ?? profile?.bio ?? '');
  const [busy, setBusy] = useState(false);
  const progress = progressFor('height-prompt');

  useEffect(() => {
    api.logOnboardingEvent('height-prompt', 'view').catch(() => undefined);
  }, []);

  const goNext = () => {
    playTick();
    setTimeout(() => router.push('/(onboarding)/permissions'), AUTO_ADVANCE_MS);
  };

  const next = async () => {
    setBusy(true);
    try {
      const trimmed = prompt.trim();
      await api.advanceOnboarding('permissions', {
        height_cm: height,
        prompt: trimmed || null,
        bio: trimmed || profile?.bio || null,
      });
      await api.clearProfileGap('height').catch(() => undefined);
      if (trimmed) await api.clearProfileGap('prompt').catch(() => undefined);
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  const skip = async () => {
    setBusy(true);
    try {
      const current = await api.getProfile();
      const gaps = Array.from(new Set([...(current?.profile_gaps ?? []), 'height', 'prompt']));
      await api.updateProfile({ profile_gaps: gaps, onboarding_step: 'permissions' });
      await api.logOnboardingEvent('height-prompt', 'skip', { gaps: ['height', 'prompt'] }).catch(() => undefined);
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      keyboard
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
      footer={
        <View style={styles.footer}>
          <Button label="Continue" onPress={next} loading={busy} large />
          <SkipLink onPress={skip} />
        </View>
      }
    >
      <Title>Height & a hook</Title>
      <Body style={styles.body}>Optional — but height and a short prompt help people say yes.</Body>

      <Text style={styles.label}>Height · {height} cm</Text>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepBtn}
          onPress={() => setHeight((h) => Math.max(120, h - 1))}
          accessibilityLabel="Decrease height"
        >
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.heightValue}>{height}</Text>
        <Pressable
          style={styles.stepBtn}
          onPress={() => setHeight((h) => Math.min(230, h + 1))}
          accessibilityLabel="Increase height"
        >
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>

      <TextInput
        placeholder="One line about you (optional)"
        value={prompt}
        onChangeText={setPrompt}
        style={styles.input}
        multiline
        placeholderTextColor={colors.textSecondary}
      />
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
  label: {
    fontFamily: fonts.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepBtnText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    lineHeight: 32,
  },
  heightValue: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    minHeight: 88,
    textAlignVertical: 'top',
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bg,
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
