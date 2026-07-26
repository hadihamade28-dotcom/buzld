import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Body, Button, Card, Chip, SectionLabel, SubScreenHeader, Title } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

const RADIUS_OPTIONS = [50, 100, 150, 250, 500];

export default function DiscoverySettingsScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const [radius, setRadius] = useState(profile?.radius_m ?? 150);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await api.updateProfile({ radius_m: radius });
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
          <Button label="Save" onPress={save} loading={busy} large />
        </View>
      }
    >
      <SubScreenHeader title="Discovery settings" onBack={() => router.back()} />
      <Title style={{ fontSize: 24 }}>Search radius</Title>
      <Body style={{ marginTop: spacing.xs, marginBottom: spacing.lg }}>
        How far Vicino searches when you are live.
      </Body>

      <View style={styles.chipRow}>
        {RADIUS_OPTIONS.map((r) => (
          <Chip
            key={r}
            label={r >= 1000 ? `${r / 1000}km` : `${r}m`}
            active={radius === r}
            onPress={() => setRadius(r)}
          />
        ))}
      </View>

      <Card style={styles.hintCard}>
        <Text style={styles.hint}>
          Currently searching within <Text style={styles.bold}>{radius}m</Text>. Bluetooth still confirms when someone is within a few meters.
        </Text>
      </Card>
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hintCard: { marginTop: spacing.lg },
  hint: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  bold: { fontFamily: fonts.bodyBold, color: colors.text },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
