import React, { useEffect } from 'react';

import { PhotoImage } from '@/components/PhotoImage';
import { SwipeActions } from '@/components/SwipeActions';
import { colors, fonts, gradients, spacing } from '@/constants/theme';
import { playMatchBuzz } from '@/lib/haptics';
import type { RevealedPeer } from '@/lib/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  reveal: RevealedPeer | null;
  onContinue: () => void;
  onPass: () => void;
  busy?: boolean;
};

export function MatchReveal({ reveal, onContinue, onPass, busy }: Props) {
  const shake = useSharedValue(0);

  useEffect(() => {
    if (!reveal) return;
    playMatchBuzz(reveal.match.haptic_seed);
    shake.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(0, { duration: 120 }),
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );
  }, [reveal, shake]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + shake.value * 0.015 }],
  }));

  if (!reveal) return null;

  const photo = reveal.peer.photo_urls[0];

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen">
      <View style={styles.root}>
        {photo ? (
          <PhotoImage path={photo} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.mist }]} />
        )}

        <LinearGradient colors={[...gradients.cardScrim]} style={StyleSheet.absoluteFill} />

        <Animated.View entering={FadeInUp.duration(400)} style={[styles.topBadge, pulseStyle]}>
          <LinearGradient colors={[...gradients.flame]} style={styles.badge}>
            <Text style={styles.badgeText}>📳 It's a buzz!</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(450).delay(80)} style={[styles.bottom, pulseStyle]}>
          <Text style={styles.name}>{reveal.peer.display_name}</Text>
          {reveal.peer.bio ? (
            <View style={styles.bioCard}>
              <Text style={styles.bioLabel}>About</Text>
              <Text style={styles.bio} numberOfLines={3}>
                {reveal.peer.bio}
              </Text>
            </View>
          ) : null}
          <Text style={styles.hint}>You're both nearby · Same vibration · Your move</Text>
        </Animated.View>

        <View style={styles.actions}>
          <SwipeActions onPass={onPass} onLike={onContinue} likeLoading={busy} disabled={busy} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  topBadge: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  badgeText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 14 },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 130,
    paddingHorizontal: spacing.lg,
  },
  name: {
    fontFamily: fonts.display,
    color: colors.textOnPhoto,
    fontSize: 42,
    letterSpacing: -1.2,
    textShadowColor: colors.overlayLight,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  bioCard: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  bioLabel: {
    fontFamily: fonts.bodyBold,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bio: {
    fontFamily: fonts.displayMedium,
    color: colors.textOnPhoto,
    fontSize: 18,
    lineHeight: 26,
  },
  hint: {
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: spacing.md,
    letterSpacing: 0.2,
  },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.xl,
  },
});
