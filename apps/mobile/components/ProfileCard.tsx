import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { colors, fonts, layout, radii, shadows, spacing } from '@/constants/theme';

type Props = {
  name: string;
  age?: number;
  bio?: string | null;
  photoUri?: string | null;
  distance?: string;
  tags?: string[];
  badge?: string;
  dimmed?: boolean;
  style?: ViewStyle;
};

export function ProfileCard({
  name,
  age,
  bio,
  photoUri,
  distance,
  tags,
  badge,
  dimmed,
  style,
}: Props) {
  return (
    <View style={[styles.card, dimmed && styles.dimmed, style]}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📷</Text>
          <Text style={styles.placeholderText}>Add a photo to get started</Text>
        </View>
      )}

      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.scrim} />

      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {name}
            {age ? <Text style={styles.age}> {age}</Text> : null}
          </Text>
          {distance ? <Text style={styles.distance}>{distance}</Text> : null}
        </View>
        {bio ? (
          <Text style={styles.bio} numberOfLines={2}>
            {bio}
          </Text>
        ) : null}
        {tags && tags.length > 0 ? (
          <View style={styles.tags}>
            {tags.slice(0, 3).map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 280,
    maxHeight: layout.cardHeight,
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.mist,
    ...shadows.card,
  },
  dimmed: { opacity: 0.85 },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    gap: spacing.sm,
  },
  placeholderIcon: { fontSize: 40 },
  placeholderText: {
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    fontSize: 15,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  badge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(254,60,114,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    color: '#FFF',
    fontSize: 12,
  },
  info: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: fonts.display,
    color: '#FFF',
    fontSize: 28,
    letterSpacing: -0.5,
    flex: 1,
  },
  age: { fontFamily: fonts.body, fontSize: 26 },
  distance: {
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  bio: {
    fontFamily: fonts.body,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginTop: spacing.xs,
    lineHeight: 21,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  tagText: {
    fontFamily: fonts.bodyMedium,
    color: '#FFF',
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
