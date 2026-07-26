import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import {
  Body,
  Button,
  Chip,
  Input,
  OnboardingProgress,
  PhotoPicker,
  SectionLabel,
  Title,
} from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Gender, Seeking } from '@/lib/types';

const genders: Gender[] = ['woman', 'man', 'nonbinary', 'other'];
const seeking: Seeking[] = ['woman', 'man', 'nonbinary', 'everyone'];

export default function ProfileOnboarding() {
  const { refresh, profile } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [seek, setSeek] = useState<Seeking | null>(profile?.seeking ?? null);
  const [photo, setPhoto] = useState<string | null>(profile?.photo_urls?.[0] ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]) setPhoto(res.assets[0].uri);
  };

  const next = async () => {
    if (!name.trim() || !gender || !seek || !photo) {
      setError('Add a name, photo, gender, and who you are open to.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const photoPath = await api.uploadPhoto(photo);
      await api.updateProfile({
        display_name: name.trim(),
        bio: bio.trim() || null,
        gender,
        seeking: seek,
        photo_urls: [photoPath],
        birthdate: '1998-01-01',
      });
      await refresh();
      router.push('/(onboarding)/interests');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      keyboard
      headerHeight={140}
      header={<OnboardingProgress step={1} total={3} />}
      footer={
        <View style={styles.footer}>
          <Button label="Continue" onPress={next} loading={busy} large />
        </View>
      }
    >
      <Title>Add photos</Title>
      <Body style={{ marginTop: spacing.xs, marginBottom: spacing.md }}>
        Your first photo is what people see when you match nearby.
      </Body>

      <PhotoPicker uri={photo} onPress={pickPhoto} height={280} hint="Add photo" />

      <Input placeholder="First name" value={name} onChangeText={setName} />
      <Input placeholder="Write a short bio…" value={bio} onChangeText={setBio} style={styles.bioInput} multiline />

      <SectionLabel style={{ marginTop: spacing.md }}>I am</SectionLabel>
      <View style={styles.chipRow}>
        {genders.map((g) => (
          <Chip key={g} label={g} active={gender === g} onPress={() => setGender(g)} />
        ))}
      </View>

      <SectionLabel style={{ marginTop: spacing.md }}>Interested in</SectionLabel>
      <View style={styles.chipRow}>
        {seeking.map((g) => (
          <Chip key={g} label={g} active={seek === g} onPress={() => setSeek(g)} />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  bioInput: { height: 88, textAlignVertical: 'top' as const, paddingTop: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { color: colors.danger, marginTop: spacing.sm, fontFamily: fonts.body },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
