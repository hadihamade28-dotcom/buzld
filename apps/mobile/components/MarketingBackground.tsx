import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { gradients } from '@/constants/theme';

/** Verified Unsplash — couples, nights out, and date vibes */
export const MARKETING_PHOTOS = [
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80',
] as const;

/** Portrait-friendly picks for the landing card stack */
export const CARD_STACK_PHOTOS = [
  MARKETING_PHOTOS[3],
  MARKETING_PHOTOS[0],
  MARKETING_PHOTOS[1],
] as const;

const SCRIM = ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.45)', 'rgba(254,60,114,0.72)', 'rgba(26,26,26,0.88)'] as const;
const SCRIM_LIGHT = ['rgba(255,255,255,0.1)', 'rgba(255,240,245,0.88)', 'rgba(245,245,247,0.96)'] as const;

type Props = {
  variant?: 'collage' | 'hero' | 'simple';
  /** Lighter scrim for login form readability */
  light?: boolean;
};

/** Tinder/Hinge-style full-bleed photo background with gradient scrim */
export function MarketingBackground({ variant = 'collage', light }: Props) {
  if (variant === 'simple') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#2a1822', '#1a151c', '#121214']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(254,60,114,0.28)', 'rgba(254,60,114,0.06)', 'transparent']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  if (variant === 'hero') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <Image source={{ uri: MARKETING_PHOTOS[0] }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
        <LinearGradient colors={light ? [...SCRIM_LIGHT] : [...SCRIM]} locations={[0, 0.45, 0.75, 1]} style={StyleSheet.absoluteFill} />
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={styles.collage}>
        {MARKETING_PHOTOS.slice(0, 4).map((uri) => (
          <Image key={uri} source={{ uri }} style={styles.tile} contentFit="cover" transition={300} />
        ))}
      </View>
      <LinearGradient
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.55)', 'rgba(254,60,114,0.65)', 'rgba(20,20,22,0.92)']}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[...gradients.flameSoft]}
        style={[StyleSheet.absoluteFill, { opacity: 0.35 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  collage: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    width: '50%',
    height: '50%',
  },
});
