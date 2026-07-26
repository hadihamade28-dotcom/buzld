import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SkipLink } from '@/components/OnboardingChoices';
import { FlowShell } from '@/components/FlowShell';
import { Body, Button, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import {
  AUTO_ADVANCE_MS,
  defaultSeekHeightRange,
  flashAudienceFromSeeking,
  progressFor,
} from '@/lib/onboarding';

export default function HeightRangeScreen() {
  const { profile, prefs, refresh } = useAuth();
  const router = useRouter();
  const audience = flashAudienceFromSeeking(profile?.seeking);
  const initialSelf = profile?.height_cm ?? 170;
  const seekDefaults = useMemo(
    () => defaultSeekHeightRange(audience, initialSelf),
    [audience, initialSelf],
  );
  const [height, setHeight] = useState(initialSelf);
  const [minH, setMinH] = useState(prefs?.height_cm_min ?? seekDefaults.min);
  const [maxH, setMaxH] = useState(prefs?.height_cm_max ?? seekDefaults.max);
  const [prompt, setPrompt] = useState(profile?.prompt ?? profile?.bio ?? '');
  const [busy, setBusy] = useState(false);
  const progress = progressFor('height-range');

  useEffect(() => {
    if (prefs?.height_cm_min == null && prefs?.height_cm_max == null) {
      setMinH(seekDefaults.min);
      setMaxH(seekDefaults.max);
    }
  }, [seekDefaults, prefs?.height_cm_min, prefs?.height_cm_max]);

  useEffect(() => {
    api.logOnboardingEvent('height-range', 'view', { audience }).catch(() => undefined);
  }, [audience]);

  const resetSeekDefaults = () => {
    setMinH(seekDefaults.min);
    setMaxH(seekDefaults.max);
  };

  const goNext = () => {
    playTick();
    setTimeout(() => router.push('/(onboarding)/style'), AUTO_ADVANCE_MS);
  };

  const next = async () => {
    setBusy(true);
    try {
      const lo = Math.min(minH, maxH);
      const hi = Math.max(minH, maxH);
      const trimmed = prompt.trim();
      await api.advanceOnboarding('style', {
        height_cm: height,
        prompt: trimmed || null,
        bio: trimmed || profile?.bio || null,
      });
      await api.setPrefs({ height_cm_min: lo, height_cm_max: hi });
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
      await api.updateProfile({ profile_gaps: gaps, onboarding_step: 'style' });
      await api
        .logOnboardingEvent('height-range', 'skip', { gaps: ['height', 'prompt'] })
        .catch(() => undefined);
      await refresh();
      goNext();
    } finally {
      setBusy(false);
    }
  };

  const who =
    audience === 'women' ? 'women' : audience === 'men' ? 'men' : 'people you’re open to';

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
      <Title>Height</Title>
      <Body style={styles.body}>
        Yours, plus a soft range for {who} — not a hard filter.
      </Body>

      <Text style={styles.label}>Your height · {height} cm</Text>
      <View style={styles.stepper}>
        <Pressable
          style={styles.stepBtn}
          onPress={() => setHeight((h) => Math.max(120, h - 1))}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.heightValue}>{height}</Text>
        <Pressable
          style={styles.stepBtn}
          onPress={() => setHeight((h) => Math.min(230, h + 1))}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.seekHeader}>
        <Text style={styles.label}>
          Seeking {who} · {Math.min(minH, maxH)}–{Math.max(minH, maxH)} cm
        </Text>
        <Pressable onPress={resetSeekDefaults} hitSlop={8}>
          <Text style={styles.reset}>Reset</Text>
        </Pressable>
      </View>
      <View style={styles.rangeRow}>
        <View style={styles.rangeCol}>
          <Text style={styles.rangeLabel}>Min</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtnSm} onPress={() => setMinH((v) => Math.max(120, v - 1))}>
              <Text style={styles.stepBtnTextSm}>−</Text>
            </Pressable>
            <Text style={styles.rangeValue}>{minH}</Text>
            <Pressable style={styles.stepBtnSm} onPress={() => setMinH((v) => Math.min(maxH, v + 1))}>
              <Text style={styles.stepBtnTextSm}>+</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.rangeCol}>
          <Text style={styles.rangeLabel}>Max</Text>
          <View style={styles.stepper}>
            <Pressable style={styles.stepBtnSm} onPress={() => setMaxH((v) => Math.max(minH, v - 1))}>
              <Text style={styles.stepBtnTextSm}>−</Text>
            </Pressable>
            <Text style={styles.rangeValue}>{maxH}</Text>
            <Pressable style={styles.stepBtnSm} onPress={() => setMaxH((v) => Math.min(230, v + 1))}>
              <Text style={styles.stepBtnTextSm}>+</Text>
            </Pressable>
          </View>
        </View>
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
    flex: 1,
  },
  seekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reset: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.rose,
    textDecorationLine: 'underline',
    marginBottom: spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
  stepBtnSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  stepBtnTextSm: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    lineHeight: 26,
  },
  heightValue: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  rangeRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  rangeCol: { flex: 1 },
  rangeLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  rangeValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    minWidth: 44,
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
