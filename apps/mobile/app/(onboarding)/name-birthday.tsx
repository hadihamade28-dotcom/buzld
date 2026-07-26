import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Body, Button, OnboardingProgress, Title } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { AUTO_ADVANCE_MS, progressFor } from '@/lib/onboarding';

function parseBirthdate(value: string | null | undefined): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  // Default ~25 years old — never hardcode a fake fixed date into the profile
  const d = new Date();
  d.setFullYear(d.getFullYear() - 25);
  return d;
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function NameBirthdayScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const initialDate = useMemo(() => parseBirthdate(profile?.birthdate), [profile?.birthdate]);
  const [name, setName] = useState(profile?.display_name || '');
  const [birthDate, setBirthDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progress = progressFor('name-birthday');

  useEffect(() => {
    api.logOnboardingEvent('name-birthday', 'view').catch(() => undefined);
  }, []);

  const next = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Add your first name.');
      return;
    }
    const birthdate = toIsoDate(birthDate);
    const ageYears = Math.floor(
      (Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    if (ageYears < 18) {
      setError('You must be 18 or older.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.advanceOnboarding('gender', {
        display_name: trimmed,
        birthdate,
      });
      await refresh();
      playTick();
      setTimeout(() => router.push('/(onboarding)/gender'), AUTO_ADVANCE_MS);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FlowShell
      keyboard
      headerHeight={120}
      header={<OnboardingProgress step={progress.step} total={progress.total} />}
      footer={
        <View style={styles.footer}>
          <Button label="Continue" onPress={next} loading={busy} large />
        </View>
      }
    >
      <Title>What’s your name?</Title>
      <Body style={styles.body}>Birthday stays private — we only use it for age matching.</Body>

      <TextInput
        placeholder="First name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Birthday</Text>
      {Platform.OS === 'android' ? (
        <Pressable style={styles.dateBtn} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateBtnText}>{toIsoDate(birthDate)}</Text>
        </Pressable>
      ) : null}

      {(showPicker || Platform.OS === 'ios') && (
        <DateTimePicker
          value={birthDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
          onChange={(_, date) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (date) setBirthDate(date);
          }}
        />
      )}

      {error ? <Body style={styles.error}>{error}</Body> : null}
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.bg,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    backgroundColor: colors.bg,
  },
  dateBtnText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
  },
  error: { color: colors.danger, marginTop: spacing.sm },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
