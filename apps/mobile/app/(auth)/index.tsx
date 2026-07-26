import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CARD_STACK_PHOTOS, MarketingBackground } from '@/components/MarketingBackground';
import { VicinoLogo } from '@/components/VicinoLogo';
import { Button } from '@/components/ui';
import { colors, fonts, gradients, radii, shadows, spacing } from '@/constants/theme';

const FEATURES = [
  { icon: '📍', label: 'Real proximity' },
  { icon: '📳', label: 'Feel the buzz' },
  { icon: '♥', label: 'Match & chat' },
];

function PhotoCard({
  uri,
  width,
  height,
  style,
  delay,
}: {
  uri: string;
  width: number;
  height: number;
  style: object;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInUp.duration(700).delay(delay)}
      style={[styles.card, { width, height }, style, shadows.card]}
    >
      <Image
        source={{ uri }}
        style={{ width, height, backgroundColor: colors.surfaceMuted }}
        contentFit="cover"
        transition={400}
        recyclingKey={uri}
      />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.45)']} style={styles.cardScrim} />
    </Animated.View>
  );
}

export default function WelcomeLandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const compact = height < 740;
  const short = height < 680;
  const cardW = Math.min(short ? 150 : 180, width - 120);
  const cardH = Math.round(cardW * 1.28);
  const showCards = height >= 600 && !short;

  return (
    <View style={styles.root}>
      <MarketingBackground variant="simple" />

      <View style={styles.heroWrap}>
        <ScrollView
          style={styles.heroScroll}
          contentContainerStyle={[
            styles.heroScrollContent,
            { paddingTop: insets.top + spacing.md, paddingBottom: spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
          bounces
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(500)}>
            <VicinoLogo large light />
          </Animated.View>

          <Animated.Text entering={FadeInDown.duration(650).delay(120)} style={[styles.headline, compact && styles.headlineCompact]}>
            Feel the buzz{'\n'}when they're close
          </Animated.Text>

          <Animated.Text entering={FadeInDown.duration(600).delay(200)} style={styles.tagline}>
            Proximity dating for the moment you're in
          </Animated.Text>

          {showCards ? (
            <View style={[styles.cardStack, { width: cardW + 36, height: cardH + 24 }]}>
              <PhotoCard uri={CARD_STACK_PHOTOS[0]} width={cardW} height={cardH} style={styles.cardBack} delay={200} />
              <PhotoCard uri={CARD_STACK_PHOTOS[1]} width={cardW} height={cardH} style={styles.cardMid} delay={280} />
              <PhotoCard uri={CARD_STACK_PHOTOS[2]} width={cardW} height={cardH} style={styles.cardFront} delay={360} />
              <Animated.View entering={FadeInUp.duration(500).delay(500)} style={styles.buzzBadge}>
                <LinearGradient colors={[...gradients.flame]} style={styles.buzzBadgeInner}>
                  <Text style={styles.buzzText}>📳 Buzz match</Text>
                </LinearGradient>
              </Animated.View>
            </View>
          ) : null}

          {!compact ? (
            <Animated.View entering={FadeInDown.duration(500).delay(420)} style={styles.features}>
              {FEATURES.map((f) => (
                <View key={f.label} style={styles.featurePill}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </Animated.View>
          ) : null}
        </ScrollView>
      </View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(200)}
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md }]}
      >
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Meet people in the moment</Text>
        <Text style={styles.sheetSub}>
          No endless swiping through strangers miles away. Vicino is for right here, right now.
        </Text>

        <Button
          label="Create account"
          onPress={() => router.push({ pathname: '/(auth)/login', params: { mode: 'up' } })}
          large
          style={styles.primaryBtn}
        />

        <Pressable
          onPress={() => router.push({ pathname: '/(auth)/login', params: { mode: 'in' } })}
          style={({ pressed }) => [styles.signInBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInLink}>Sign in</Text>
          </Text>
        </Pressable>

        <Text style={styles.legal}>
          By continuing you agree to our Terms and Privacy Policy
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  heroWrap: {
    flex: 1,
    minHeight: 0,
  },
  heroScroll: {
    flex: 1,
  },
  heroScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -1.2,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  headlineCompact: {
    fontSize: 30,
    lineHeight: 36,
  },
  tagline: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
  },
  cardStack: {
    marginTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    position: 'absolute',
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  cardScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  cardBack: { transform: [{ rotate: '-14deg' }, { translateY: 10 }], opacity: 0.7 },
  cardMid: { transform: [{ rotate: '7deg' }, { translateY: 4 }], opacity: 0.85 },
  cardFront: { transform: [{ rotate: '-2deg' }] },
  buzzBadge: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
  },
  buzzBadgeInner: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
    ...shadows.glow,
  },
  buzzText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 12 },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  featureIcon: { fontSize: 14 },
  featureLabel: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 12 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginTop: -24,
    ...shadows.float,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassStrong,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.text,
    textAlign: 'center',
  },
  sheetSub: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryBtn: { width: '100%' },
  signInBtn: { alignItems: 'center', paddingVertical: spacing.md },
  signInText: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 15 },
  signInLink: { fontFamily: fonts.bodyBold, color: colors.rose },
  legal: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
