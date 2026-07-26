import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { PROFILE_GAP_COPY } from '@/lib/types';

const GAP_ROUTES: Record<string, string> = {
  interests: '/profile/interests',
  lifestyle: '/profile/edit',
  flash: '/profile/edit',
  height: '/profile/edit',
  prompt: '/profile/edit',
};

export function ProfileBoostPrompt() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const gap = useMemo(() => profile?.profile_gaps?.[0] ?? null, [profile?.profile_gaps]);
  if (!gap || dismissed || !PROFILE_GAP_COPY[gap]) return null;

  const dismiss = async () => {
    setDismissed(true);
    try {
      await api.clearProfileGap(gap);
      await refresh();
    } catch {
      // keep dismissed locally
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>Profile boost</Text>
      <Text style={styles.body}>{PROFILE_GAP_COPY[gap]}</Text>
      <View style={styles.row}>
        <Pressable
          style={styles.primary}
          onPress={() => router.push(GAP_ROUTES[gap] as never)}
        >
          <Text style={styles.primaryText}>Add now</Text>
        </Pressable>
        <Pressable onPress={dismiss} hitSlop={8}>
          <Text style={styles.later}>Later</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.rose,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  primary: {
    backgroundColor: colors.rose,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  primaryText: {
    fontFamily: fonts.bodyBold,
    color: '#fff',
    fontSize: 13,
  },
  later: {
    fontFamily: fonts.bodyMedium,
    color: colors.textSecondary,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});
