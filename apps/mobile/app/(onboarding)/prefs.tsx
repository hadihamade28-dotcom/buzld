import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Body, Button, Chip, OnboardingProgress, SectionLabel, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { LOOKING_FOR_TAGS, STYLE_TAGS } from '@/lib/types';

export default function PrefsOnboarding() {
  const { prefs, refresh } = useAuth();
  const router = useRouter();
  const [styleTags, setStyleTags] = useState<string[]>(prefs?.style_tags ?? []);
  const [looking, setLooking] = useState<string[]>(prefs?.looking_for_tags ?? []);
  const [busy, setBusy] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  const finish = async () => {
    setBusy(true);
    try {
      await api.setPrefs({
        style_tags: styleTags,
        looking_for_tags: looking,
        height_cm_min: 150,
        height_cm_max: 200,
      });
      await api.updateProfile({ onboarding_complete: true, discovery_enabled: true });
      await refresh();
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      headerHeight={140}
      header={<OnboardingProgress step={3} total={3} />}
      footer={
        <View style={styles.footer}>
          <Button label="Start matching" onPress={finish} loading={busy} large />
        </View>
      }
    >
      <Title>Your type?</Title>
      <Body style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
        Optional preferences — never shown on your profile, just used for matching.
      </Body>

      <SectionLabel>My vibe</SectionLabel>
      <View style={styles.chipRow}>
        {STYLE_TAGS.map((tag) => (
          <Chip key={tag} label={tag} active={styleTags.includes(tag)} onPress={() => toggle(styleTags, setStyleTags, tag)} />
        ))}
      </View>

      <SectionLabel style={{ marginTop: spacing.lg }}>Into</SectionLabel>
      <View style={styles.chipRow}>
        {LOOKING_FOR_TAGS.map((tag) => (
          <Chip key={tag} label={tag} active={looking.includes(tag)} onPress={() => toggle(looking, setLooking, tag)} />
        ))}
      </View>
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
