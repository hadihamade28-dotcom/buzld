import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Body, Button, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, progressFor } from '@/lib/onboarding';
import { isStoragePath, resolvePhotoUrl } from '@/lib/photos';

const MAX_PHOTOS = 6;

export default function PhotosScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const [uris, setUris] = useState<string[]>(profile?.photo_urls ?? []);
  const [display, setDisplay] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progress = progressFor('photos');

  useEffect(() => {
    api.logOnboardingEvent('photos', 'view').catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: Record<string, string> = {};
      for (const uri of uris) {
        if (!isStoragePath(uri)) {
          next[uri] = uri;
          continue;
        }
        const resolved = await resolvePhotoUrl(uri);
        if (resolved) next[uri] = resolved;
      }
      if (!cancelled) setDisplay(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [uris]);

  const pick = async () => {
    const remaining = MAX_PHOTOS - uris.length;
    if (remaining <= 0) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
    });
    if (res.canceled || !res.assets?.length) return;
    setUris((prev) => [...prev, ...res.assets.map((a) => a.uri)].slice(0, MAX_PHOTOS));
  };

  const removeAt = (index: number) => {
    setUris((prev) => prev.filter((_, i) => i !== index));
  };

  const makeMain = (index: number) => {
    setUris((prev) => {
      if (index <= 0) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  const next = async () => {
    if (!uris.length) {
      setError('Add at least one photo to continue.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < uris.length; i++) {
        const uri = uris[i];
        if (isStoragePath(uri) && !uri.startsWith('file://')) {
          uploaded.push(uri);
        } else {
          uploaded.push(await api.uploadPhoto(uri, i));
        }
      }
      await api.advanceOnboarding('interests', { photo_urls: uploaded });
      await refresh();
      playTick();
      setTimeout(() => router.push('/(onboarding)/interests'), AUTO_ADVANCE_MS);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
      footer={
        <View style={styles.footer}>
          <Button label="Continue" onPress={next} loading={busy} disabled={!uris.length} large />
        </View>
      }
    >
      <Title>Add photos</Title>
      <Body style={styles.body}>
        One is enough to start. Profiles with 4+ photos get 3× more buzzes.
      </Body>

      <View style={styles.grid}>
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
          const uri = uris[i];
          return (
            <Pressable
              key={i}
              onPress={() => (uri ? makeMain(i) : pick())}
              onLongPress={() => uri && removeAt(i)}
              style={styles.slot}
            >
              {uri ? (
                <Image source={{ uri: display[uri] ?? uri }} style={styles.image} />
              ) : (
                <Text style={styles.plus}>+</Text>
              )}
              {i === 0 && uri ? (
                <View style={styles.star}>
                  <Text style={styles.starText}>★ main</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <Body style={styles.hint}>Tap empty slot to add · tap photo to make main · long-press to delete</Body>
      {error ? <Body style={styles.error}>{error}</Body> : null}
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.md, color: colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slot: {
    width: '31%',
    aspectRatio: 3 / 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  plus: { fontSize: 28, color: colors.textSecondary },
  star: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  starText: { color: '#fff', fontFamily: fonts.bodyBold, fontSize: 10 },
  hint: { marginTop: spacing.sm, fontSize: 12, color: colors.textSecondary },
  error: { color: colors.danger, marginTop: spacing.sm },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
