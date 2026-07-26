import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts, gradients, shadows } from '@/constants/theme';

type MarkProps = {
  size?: number;
  style?: ViewStyle;
};

/** Proximity buzz mark — radiating rings around a live pulse. */
export function VicinoLogoMark({ size = 44, style }: MarkProps) {
  const radius = size * 0.26;
  const rings = [
    { scale: 0.88, opacity: 0.22, width: 1.5 },
    { scale: 0.62, opacity: 0.42, width: 2 },
    { scale: 0.38, opacity: 0.65, width: 2.5 },
  ];

  return (
    <LinearGradient
      colors={[colors.rose, colors.coral, '#FF8A65']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.mark, { width: size, height: size, borderRadius: radius }, shadows.glow, style]}
    >
      {rings.map((ring) => {
        const dim = size * ring.scale;
        return (
          <View
            key={ring.scale}
            style={[
              styles.ring,
              {
                width: dim,
                height: dim,
                borderRadius: dim / 2,
                borderWidth: ring.width,
                opacity: ring.opacity,
              },
            ]}
          />
        );
      })}

      <View style={[styles.core, { width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09 }]} />

      <View style={[styles.buzzBar, styles.buzzLeft, { width: size * 0.07, height: size * 0.18, borderRadius: 2 }]} />
      <View style={[styles.buzzBar, styles.buzzRight, { width: size * 0.07, height: size * 0.18, borderRadius: 2 }]} />
    </LinearGradient>
  );
}

type LogoProps = {
  large?: boolean;
  light?: boolean;
  showWordmark?: boolean;
  style?: ViewStyle;
};

export function VicinoLogo({ large, light, showWordmark = true, style }: LogoProps) {
  const markSize = large ? 56 : 42;

  return (
    <View style={[styles.row, style]}>
      <VicinoLogoMark size={markSize} />
      {showWordmark ? (
        <Text style={[styles.wordmark, large && styles.wordmarkLarge, light && styles.wordmarkLight]}>
          vicino
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.95)',
  },
  core: {
    backgroundColor: colors.white,
    shadowColor: colors.white,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  buzzBar: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  buzzLeft: {
    left: '18%',
    transform: [{ rotate: '-18deg' }],
  },
  buzzRight: {
    right: '18%',
    transform: [{ rotate: '18deg' }],
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -1,
    color: colors.text,
    textTransform: 'lowercase',
  },
  wordmarkLarge: {
    fontSize: 42,
    letterSpacing: -1.4,
  },
  wordmarkLight: {
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
