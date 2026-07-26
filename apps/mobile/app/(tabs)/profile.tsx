import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/FlowShell';
import { PhotoImage } from '@/components/PhotoImage';
import { ProfileBoostPrompt } from '@/components/ProfileBoostPrompt';
import { Button, Chip, PromptCard, SectionLabel, SettingsRow, SwitchRow } from '@/components/ui';
import { colors, fonts, gradients, layout, radii, shadows, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ProfileScreen() {
  const { profile, interests, signOut, refresh } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const toggleDiscovery = async (on: boolean) => {
    setBusy(true);
    try {
      await api.updateProfile({ discovery_enabled: on });
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen padded={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: layout.tabBarInset }}
      >
        <View style={styles.heroWrap}>
          {profile?.photo_urls?.[0] ? (
            <PhotoImage path={profile.photo_urls[0]} style={styles.heroPhoto} contentFit="cover" />
          ) : (
            <View style={[styles.heroPhoto, styles.heroEmpty]}>
              <Text style={{ fontSize: 52 }}>👤</Text>
            </View>
          )}
          <LinearGradient colors={[...gradients.profileHero]} style={StyleSheet.absoluteFill} />
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{profile?.display_name}</Text>
            {profile?.gender && profile?.seeking ? (
              <Text style={styles.heroMeta}>
                {profile.gender} · Open to {profile.seeking}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>My profile</Text>
          <Text style={styles.subtitle}>How others see you nearby</Text>

          <View style={{ marginHorizontal: -spacing.lg }}>
            <ProfileBoostPrompt />
          </View>

          {profile?.bio ? <PromptCard prompt="About me" answer={profile.bio} /> : null}

          {interests.length > 0 ? (
            <View style={styles.section}>
              <SectionLabel>Interests</SectionLabel>
              <View style={styles.chipRow}>
                {interests.map((tag) => (
                  <Chip key={tag} label={tag} active />
                ))}
              </View>
            </View>
          ) : null}

          <SwitchRow
            label="Show me on Vicino"
            subtitle="People nearby can discover you"
            value={!!profile?.discovery_enabled}
            onValueChange={toggleDiscovery}
            disabled={busy}
          />

          <View style={styles.settingsCard}>
            <SettingsRow label="Edit profile" subtitle="Photos, bio, preferences" onPress={() => router.push('/profile/edit')} />
            <SettingsRow label="Discovery settings" subtitle="Search radius" onPress={() => router.push('/profile/discovery')} />
            <SettingsRow label="Interests" subtitle={`${interests.length} selected`} onPress={() => router.push('/profile/interests')} />
            <SettingsRow label="Safety & privacy" subtitle="Tips and data info" onPress={() => router.push('/profile/safety')} last />
          </View>

          <Button
            label="Sign out"
            variant="ghost"
            onPress={async () => {
              await signOut();
              router.replace('/(auth)');
            }}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroWrap: { height: 300, position: 'relative', overflow: 'hidden' },
  heroPhoto: StyleSheet.absoluteFill,
  heroEmpty: { backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.xl + 16 },
  heroName: {
    fontFamily: fonts.display,
    color: colors.textOnPhoto,
    fontSize: 34,
    letterSpacing: -0.8,
  },
  heroMeta: {
    fontFamily: fonts.bodyMedium,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  sheet: {
    marginTop: -28,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    ...shadows.float,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassStrong,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    letterSpacing: -0.6,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  section: { marginBottom: spacing.md },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  settingsCard: {
    marginTop: spacing.md,
    backgroundColor: colors.bg,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
