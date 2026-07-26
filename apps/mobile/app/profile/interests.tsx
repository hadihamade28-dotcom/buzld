import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Body, Button, Chip, SubScreenHeader, Title } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { INTEREST_CATALOG } from '@/lib/types';

export default function EditInterestsScreen() {
  const { interests, refresh } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(interests);
  const [busy, setBusy] = useState(false);

  const toggle = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const save = async () => {
    setBusy(true);
    try {
      await api.setInterests(selected);
      await refresh();
      router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      photo={false}
      footer={
        <View style={styles.footer}>
          <Button label="Save" onPress={save} loading={busy} disabled={selected.length < 3} large />
        </View>
      }
    >
      <SubScreenHeader title="Interests" onBack={() => router.back()} />
      <Title style={{ fontSize: 24 }}>What you're into</Title>
      <Body style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
        Pick at least 3 — we use these to find people nearby you'll click with.
      </Body>

      <View style={styles.chipRow}>
        {INTEREST_CATALOG.map((tag) => (
          <Chip key={tag} label={tag} active={selected.includes(tag)} onPress={() => toggle(tag)} />
        ))}
      </View>

      <View style={styles.counterWrap}>
        <Text style={[styles.counter, selected.length >= 3 && styles.counterDone]}>
          {selected.length}/3 minimum {selected.length >= 3 ? '✓' : ''}
        </Text>
      </View>
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  counterWrap: {
    marginTop: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.bg,
    paddingVertical: 12,
    borderRadius: 999,
  },
  counter: { fontFamily: fonts.bodyMedium, color: colors.textSecondary, fontSize: 14 },
  counterDone: { color: colors.rose, fontFamily: fonts.bodyBold },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
