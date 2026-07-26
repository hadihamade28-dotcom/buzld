import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii, spacing } from '@/constants/theme';

export function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; hint?: string }[];
  value?: string | null;
  onChange: (id: string) => void;
}) {
  return (
    <View style={styles.grid}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[styles.card, active && styles.cardActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
            {opt.hint ? (
              <Text style={[styles.hint, active && styles.hintActive]}>{opt.hint}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function SkipLink({ label = 'Skip — finish later', onPress }: { label?: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.skip}>
      <Text style={styles.skipText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  cardActive: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: colors.text,
    textTransform: 'capitalize',
  },
  labelActive: { color: colors.rose },
  hint: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  hintActive: { color: colors.rose },
  skip: { alignItems: 'center', paddingVertical: spacing.sm },
  skipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
