import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Button, Chip, Input, PhotoPicker, SectionLabel, SubScreenHeader, Title } from '@/components/ui';
import { colors, fonts, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MAX_LOOKING_FOR_TAGS, MAX_STYLE_TAGS, flashAudienceFromSeeking, lookingForTagsFor } from '@/lib/onboarding';
import { isStoragePath } from '@/lib/photos';
import { STYLE_TAGS, type Gender, type Seeking } from '@/lib/types';

const genders: Gender[] = ['woman', 'man', 'nonbinary', 'other'];
const seeking: Seeking[] = ['woman', 'man', 'nonbinary', 'everyone'];

export default function EditProfileScreen() {
  const { profile, prefs, refresh } = useAuth();
  const router = useRouter();
  const existingPhoto = profile?.photo_urls?.[0] ?? null;

  const [name, setName] = useState(profile?.display_name ?? '');
  const [bio, setBio] = useState(profile?.bio ?? profile?.prompt ?? '');
  const [height, setHeight] = useState(
    profile?.height_cm != null ? String(profile.height_cm) : '',
  );
  const [heightMin, setHeightMin] = useState(
    prefs?.height_cm_min != null ? String(prefs.height_cm_min) : '',
  );
  const [heightMax, setHeightMax] = useState(
    prefs?.height_cm_max != null ? String(prefs.height_cm_max) : '',
  );
  const [lookingFor, setLookingFor] = useState<string[]>(prefs?.looking_for_tags ?? []);
  const [styleTags, setStyleTags] = useState<string[]>(prefs?.style_tags ?? []);
  const [gender, setGender] = useState<Gender | null>(profile?.gender ?? null);
  const [seek, setSeek] = useState<Seeking | null>(profile?.seeking ?? null);
  const [localPhoto, setLocalPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookCatalog = lookingForTagsFor(flashAudienceFromSeeking(seek));
  const displayPhoto = localPhoto ?? existingPhoto;
  const isRemotePhoto = displayPhoto && isStoragePath(displayPhoto) && !localPhoto;

  const toggleLooking = (tag: string) => {
    setLookingFor((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_LOOKING_FOR_TAGS) return prev;
      return [...prev, tag];
    });
  };

  const toggleStyle = (tag: string) => {
    setStyleTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_STYLE_TAGS) return prev;
      return [...prev, tag];
    });
  };

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
    const minCm = heightMin.trim() ? Number(heightMin) : null;
    const maxCm = heightMax.trim() ? Number(heightMax) : null;
    if (
      (heightMin.trim() && (Number.isNaN(minCm!) || minCm! < 120 || minCm! > 230)) ||
      (heightMax.trim() && (Number.isNaN(maxCm!) || maxCm! < 120 || maxCm! > 230))
    ) {
      setError('Seeking height must be between 120 and 230 cm.');
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
      await api.setPrefs({
        looking_for_tags: lookingFor,
        style_tags: styleTags,
        height_cm_min: minCm != null && maxCm != null ? Math.min(minCm, maxCm) : minCm,
        height_cm_max: minCm != null && maxCm != null ? Math.max(minCm, maxCm) : maxCm,
      });
      if (heightCm) await api.clearProfileGap('height').catch(() => undefined);
      if (trimmedBio) await api.clearProfileGap('prompt').catch(() => undefined);
      if (lookingFor.length) await api.clearProfileGap('looking_for').catch(() => undefined);
      if (styleTags.length) await api.clearProfileGap('style').catch(() => undefined);
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
        placeholder="Your height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="number-pad"
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Seek min cm"
            value={heightMin}
            onChangeText={setHeightMin}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Seek max cm"
            value={heightMax}
            onChangeText={setHeightMax}
            keyboardType="number-pad"
          />
        </View>
      </View>

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

      <SectionLabel style={{ marginTop: spacing.md }}>
        Anything you notice ({lookingFor.length}/{MAX_LOOKING_FOR_TAGS})
      </SectionLabel>
      <View style={styles.chipRow}>
        {lookCatalog.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            active={lookingFor.includes(tag)}
            onPress={() => toggleLooking(tag)}
          />
        ))}
      </View>

      <SectionLabel style={{ marginTop: spacing.md }}>
        Your look ({styleTags.length}/{MAX_STYLE_TAGS})
      </SectionLabel>
      <View style={styles.chipRow}>
        {STYLE_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            active={styleTags.includes(tag)}
            onPress={() => toggleStyle(tag)}
          />
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  bioInput: { height: 88, textAlignVertical: 'top' as const, paddingTop: 14 },
  row: { flexDirection: 'row', gap: spacing.sm },
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
