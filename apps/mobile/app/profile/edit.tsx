import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Button, Chip, Input, PhotoPicker, SectionLabel, SubScreenHeader, Title } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { isStoragePath } from '@/lib/photos';
import type { Gender, Seeking } from '@/lib/types';

const genders: Gender[] = ['woman', 'man', 'nonbinary', 'other'];
const seeking: Seeking[] = ['woman', 'man', 'nonbinary', 'everyone'];

export default function EditProfileScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const existingPhoto = profile?.photo_urls?.[0] ?? null;

  const [name, setName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? profile?.prompt ?? '');
  const [height, setHeight] = useState(
    profile?.height_cm != null ? String(profile.height_cm) : '',
  );
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [seek, setSeek] = useState<Seeking | null>(profile?.seeking ?? null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayPhoto = localPhoto ?? existingPhoto;
  const isRemotePhoto = displayPhoto && isStoragePath(displayPhoto) && !localPhoto;

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]) setLocalPhoto(res.assets[0].uri);
  };

  const save = async () => {
    if (!name.trim() || !gender || !seek) {
      setError('Name, gender, and seeking are required.');
      return;
    }
    const heightCm = height.trim() ? Number(height) : null;
    if (height.trim() && (Number.isNaN(heightCm!) || heightCm! < 120 || heightCm! > 230)) {
      setError('Height must be between 120 and 230 cm.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let photoPath = existingPhoto;
      if (localPhoto) photoPath = await api.uploadPhoto(localPhoto);
      const trimmedBio = bio.trim();
      await api.updateProfile({
        display_name: name.trim(),
        bio: trimmedBio || null,
        prompt: trimmedBio || null,
        height_cm: heightCm,
        gender,
        seeking: seek,
        photo_urls: photoPath ? [photoPath] : [],
      });
      if (heightCm) await api.clearProfileGap('height').catch(() => undefined);
      if (trimmedBio) await api.clearProfileGap('prompt').catch(() => undefined);
      await refresh();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      photo={false}
      keyboard
      footer={
        <View style={styles.footer}>
          <Button label="Save changes" onPress={save} loading={busy} large />
        </View>
      }
    >
      <SubScreenHeader title="Edit profile" onBack={() => router.back()} />
      <Title style={{ fontSize: 24, marginBottom: spacing.md }}>Your details</Title>

      <PhotoPicker
        uri={localPhoto}
        remotePath={isRemotePhoto ? displayPhoto : null}
        onPress={pickPhoto}
        height={260}
        hint="Change photo"
      />

      <Input placeholder="First name" value={name} onChangeText={setName} />
      <Input
        placeholder="Bio / prompt"
        value={bio}
        onChangeText={setBio}
        style={styles.bioInput}
        multiline
      />
      <Input
        placeholder="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="number-pad"
      />

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
