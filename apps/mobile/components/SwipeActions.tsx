import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, gradients, shadows, spacing } from '@/constants/theme';

type Props = {
  onPass?: () => void;
  onLike?: () => void;
  onSuper?: () => void;
  likeLoading?: boolean;
  disabled?: boolean;
};

const BTN = 68;
const BTN_SM = 52;

function ActionButton({
  onPress,
  disabled,
  size = 'large',
  variant,
  loading,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  size?: 'large' | 'small';
  variant: 'pass' | 'like' | 'super';
  loading?: boolean;
  children: React.ReactNode;
}) {
  const dim = size === 'small' ? BTN_SM : BTN;
  const isDisabled = disabled || !onPress;

  if (variant === 'like') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled || loading}
        style={({ pressed }) => [
          { width: dim, height: dim, borderRadius: dim / 2 },
          styles.btnLike,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.btnDisabled,
        ]}
      >
        {loading ? (
          <View style={[styles.likeGradient, { width: dim, height: dim, borderRadius: dim / 2 }]}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : (
          <LinearGradient
            colors={isDisabled ? [colors.glassStrong, colors.glassStrong] : [...gradients.flame]}
            style={[styles.likeGradient, { width: dim, height: dim, borderRadius: dim / 2 }]}
          >
            {children}
          </LinearGradient>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        size === 'small' && { width: BTN_SM, height: BTN_SM, borderRadius: BTN_SM / 2 },
        variant === 'pass' && styles.btnPass,
        variant === 'super' && styles.btnSuper,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.btnDisabled,
      ]}
    >
      {children}
    </Pressable>
  );
}

export function SwipeActions({ onPass, onLike, onSuper, likeLoading, disabled }: Props) {
  return (
    <View style={styles.row}>
      {onSuper !== undefined ? (
        <ActionButton onPress={onSuper} disabled={disabled} size="small" variant="super">
          <Text style={[styles.icon, { color: colors.superLike, fontSize: 22 }]}>★</Text>
        </ActionButton>
      ) : (
        <View style={{ width: BTN_SM }} />
      )}

      <ActionButton onPress={onPass} disabled={disabled} variant="pass">
        <Text style={styles.passIcon}>✕</Text>
      </ActionButton>

      <ActionButton onPress={onLike} disabled={disabled} variant="like" loading={likeLoading}>
        <Text style={styles.likeIcon}>♥</Text>
      </ActionButton>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.float,
  },
  btnPass: { borderWidth: 2, borderColor: colors.glassStrong },
  btnSuper: { borderWidth: 2, borderColor: colors.glassStrong },
  btnLike: { ...shadows.glow },
  btnDisabled: { opacity: 0.4 },
  likeGradient: { alignItems: 'center', justifyContent: 'center' },
  icon: { fontWeight: '700' },
  passIcon: { color: colors.passIcon, fontSize: 28, fontWeight: '600' },
  likeIcon: { color: colors.white, fontSize: 32, marginTop: 2 },
  pressed: { transform: [{ scale: 0.9 }] },
});
