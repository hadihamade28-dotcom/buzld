import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MatchReveal } from '@/components/MatchReveal';
import { ProfileBoostPrompt } from '@/components/ProfileBoostPrompt';
import { AppScreen } from '@/components/FlowShell';
import { BrandMark, Button, StatusPill } from '@/components/ui';
import { colors, fonts, gradients, layout, radii, shadows, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { isBleLikelyAvailable } from '@/lib/ble';
import { notifyBuzz } from '@/lib/notifications';
import { useAuth } from '@/lib/auth';
import { startDiscoveryLoop } from '@/lib/presence';
import { useMatchRealtime } from '@/lib/realtime';
import type { CandidatePeer, RevealedPeer } from '@/lib/types';

const SESSION_MS = 30 * 60 * 1000;

export default function LiveScreen() {
  const { profile, refresh } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState('Ready when you are');
  const [candidates, setCandidates] = useState<CandidatePeer[]>([]);
  const [reveal, setReveal] = useState<RevealedPeer | null>(null);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [proximity, setProximity] = useState<number | null>(null);
  const [sessionEndsAt, setSessionEndsAt] = useState<number | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const stopRef = useRef<null | (() => void)>(null);
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    if (!running) {
      pulse.value = 0.35;
      return;
    }
    pulse.value = withRepeat(withTiming(1, { duration: 1600 }), -1, true);
  }, [running, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + pulse.value * 0.55,
    transform: [{ scale: 0.92 + pulse.value * 0.08 }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: running ? 0.18 + pulse.value * 0.5 : 0.1,
    transform: [{ scale: running ? 0.96 + pulse.value * 0.06 : 1 }],
  }));

  const onReveal = useCallback((r: RevealedPeer) => {
    setReveal(r);
    notifyBuzz(r.peer.display_name).catch(() => undefined);
  }, []);
  useMatchRealtime(onReveal);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setRunning(false);
    setCandidates([]);
    setProximity(null);
    setSessionEndsAt(null);
    setRemainingSec(null);
    setStatus('Ready when you are');
  }, []);

  const start = async () => {
    if (running || busy) return;
    if (Platform.OS === 'web') {
      setStatus('Discovery requires a physical device with location + Bluetooth');
      return;
    }
    setRunning(true);
    setSessionEndsAt(Date.now() + SESSION_MS);
    setStatus('Scanning nearby…');
    try {
      if (!profile?.discovery_enabled) {
        await api.updateProfile({ discovery_enabled: true });
        await refresh();
      }
      stopRef.current = await startDiscoveryLoop({
        onStatus: setStatus,
        onCandidates: setCandidates,
        onReveal,
        onProximity: setProximity,
      });
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Could not start');
      setRunning(false);
    }
  };

  const stopRefCallback = stop;

  useEffect(() => {
    if (!sessionEndsAt || !running) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((sessionEndsAt - Date.now()) / 1000));
      setRemainingSec(left);
      if (left <= 0) stopRefCallback();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sessionEndsAt, running, stopRefCallback]);

  useEffect(() => () => stopRef.current?.(), []);

  const onContinue = async () => {
    if (!reveal) return;
    setBusy(true);
    try {
      const res = await api.recordAction(reveal.match.id, 'continue');
      setReveal(null);
      if (res.conversation_id) router.push(`/chat/${res.conversation_id}`);
      else setStatus('Waiting for them to continue too…');
    } finally {
      setBusy(false);
    }
  };

  const onPass = async () => {
    if (!reveal) return;
    setBusy(true);
    try {
      await api.recordAction(reveal.match.id, 'pass');
      setReveal(null);
      setStatus('Passed — still listening');
    } finally {
      setBusy(false);
    }
  };

  const proximityLabel =
    proximity !== null
      ? proximity >= -55
        ? 'Very close — buzz incoming'
        : proximity >= -65
          ? 'Getting warmer…'
          : 'Bluetooth signal detected'
      : null;

  return (
    <AppScreen padded={false}>
      <LinearGradient colors={[...gradients.flameSoft]} style={StyleSheet.absoluteFill} />

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: layout.tabBarInset }]}
      >
        <View style={[styles.header, { paddingTop: spacing.sm }]}>
          <BrandMark />
        </View>

        <ProfileBoostPrompt />

        <View style={styles.hero}>
          <View style={styles.orbWrap}>
            <Animated.View style={[styles.ring, styles.ringOuter, ringStyle]} />
            <Animated.View style={[styles.ring, styles.ringMid, ringStyle]} />
            <Animated.View style={[styles.ring, styles.ringInner, ringStyle]} />
            <Animated.View style={[styles.orbOuter, running && glowStyle]}>
              <LinearGradient colors={[...gradients.orb]} style={styles.orb}>
                <Text style={styles.orbIcon}>{running ? '📡' : '♥'}</Text>
              </LinearGradient>
            </Animated.View>
          </View>

          <Text style={styles.heroTitle}>{running ? 'Listening…' : 'Go Live'}</Text>
          <Text style={styles.heroSub}>
            {running ? 'Finding compatible people near you' : 'Start discovering people actually around you'}
          </Text>
        </View>

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <View style={styles.handle} />
          <StatusPill label={status} live={running} />

          {candidates.length > 0 ? (
            <View style={styles.statChip}>
              <Text style={styles.statText}>
                {candidates.length} {candidates.length === 1 ? 'person' : 'people'} in range
              </Text>
            </View>
          ) : null}

          {running && remainingSec !== null ? (
            <Text style={styles.timer}>
              Live for {Math.floor(remainingSec / 60)}:{String(remainingSec % 60).padStart(2, '0')}
            </Text>
          ) : null}

          {running && proximityLabel ? (
            <View style={styles.proximityChip}>
              <Text style={styles.proximity}>{proximityLabel}</Text>
            </View>
          ) : null}

          {!isBleLikelyAvailable() && Platform.OS === 'web' ? (
            <Text style={styles.hint}>Use an iOS or Android dev build to discover nearby matches.</Text>
          ) : null}

          {running ? (
            <Button label="Pause" variant="ghost" onPress={stop} large style={styles.cta} />
          ) : (
            <Button label="Go Live" onPress={start} disabled={busy} large style={styles.cta} />
          )}
        </View>
      </ScrollView>

      <MatchReveal reveal={reveal} onContinue={onContinue} onPass={onPass} busy={busy} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg },
  header: { paddingBottom: spacing.sm },
  hero: { alignItems: 'center', paddingVertical: spacing.xl, minHeight: 320 },
  orbWrap: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1.5, borderColor: colors.rose },
  ringOuter: { width: 200, height: 200 },
  ringMid: { width: 160, height: 160 },
  ringInner: { width: 120, height: 120 },
  orbOuter: { ...shadows.glow },
  orb: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  orbIcon: { fontSize: 34 },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.text,
    letterSpacing: -1,
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 24,
    maxWidth: 280,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'center',
    marginHorizontal: -spacing.lg,
    ...shadows.float,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassStrong,
    marginBottom: spacing.lg,
  },
  statChip: {
    marginTop: spacing.md,
    backgroundColor: colors.roseSoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.full,
  },
  statText: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 13 },
  timer: { fontFamily: fonts.bodyBold, color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm },
  proximityChip: {
    marginTop: spacing.sm,
    backgroundColor: colors.hingeSoft,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  proximity: { fontFamily: fonts.bodyBold, color: colors.hinge, fontSize: 13 },
  hint: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
  cta: { width: '100%', marginTop: spacing.lg },
});
