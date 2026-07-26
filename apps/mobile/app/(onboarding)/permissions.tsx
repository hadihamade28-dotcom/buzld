import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { FlowShell } from '@/components/FlowShell';
import { Body, Button, OnboardingProgress, Title } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { playTick } from '@/lib/haptics';
import { registerForPushNotifications } from '@/lib/notifications';
import { progressFor } from '@/lib/onboarding';

export default function PermissionsScreen() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const progress = progressFor('permissions');

  useEffect(() => {
    api.logOnboardingEvent('permissions', 'view').catch(() => undefined);
  }, []);

  const finish = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const loc = await Location.requestForegroundPermissionsAsync();
      if (loc.status !== 'granted') {
        setStatus('Location helps Vicino buzz when someone compatible is nearby. You can enable it later.');
      }
      await registerForPushNotifications().catch(() => undefined);

      await api.updateProfile({
        onboarding_complete: true,
        discovery_enabled: true,
        onboarding_step: 'done',
        consent_behavioral: true,
        consent_photo_analysis: true,
      });
      await api.logOnboardingEvent('permissions', 'complete').catch(() => undefined);
      await refresh();
      playTick();
      router.replace('/(tabs)');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Something went wrong');
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
          <Button label="Enable & go live" onPress={finish} loading={busy} large />
        </View>
      }
    >
      <Title>Almost there</Title>
      <Body style={styles.body}>
        Location powers the nearby loop — we never show your exact spot, only distance. Notifications
        tell you when phones buzz.
      </Body>
      {status ? <Body style={styles.note}>{status}</Body> : null}
    </FlowShell>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: spacing.xs, marginBottom: spacing.lg, color: colors.textSecondary },
  note: { color: colors.textSecondary },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
