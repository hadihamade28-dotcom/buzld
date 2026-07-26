import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketingBackground } from '@/components/MarketingBackground';
import { BrandMark, Button } from '@/components/ui';
import { colors, fonts, radii, shadows, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

function AuthField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default';
  autoCapitalize?: 'none' | 'sentences';
}) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Ionicons name={icon} size={20} color={focused ? colors.rose : colors.textMuted} style={styles.fieldIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry && !visible}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.fieldInput}
      />
      {secureTextEntry ? (
        <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} style={styles.eyeBtn}>
          <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'in' | 'up'>(modeParam === 'in' ? 'in' : 'up');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (modeParam === 'in' || modeParam === 'up') setMode(modeParam);
  }, [modeParam]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === 'up') await signUp(email, password);
      else await signIn(email, password);
      router.replace('/(onboarding)/welcome');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in');
    } finally {
      setBusy(false);
    }
  };

  const isSignUp = mode === 'up';
  const canSubmit = email.trim().length > 0 && password.length >= 6;

  return (
    <View style={styles.root}>
      <View style={styles.photoHeader}>
        <MarketingBackground variant="hero" />
        <View style={[styles.photoOverlay, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <View style={styles.backCircle}>
              <Ionicons name="chevron-back" size={22} color={colors.white} />
            </View>
          </Pressable>
          <BrandMark large light />
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.sheetWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md }]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            contentContainerStyle={styles.sheetScroll}
          >
            <View style={styles.handle} />

            <View style={styles.tabs}>
              <Pressable onPress={() => setMode('up')} style={[styles.tab, isSignUp && styles.tabActive]}>
                <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Sign up</Text>
              </Pressable>
              <Pressable onPress={() => setMode('in')} style={[styles.tab, !isSignUp && styles.tabActive]}>
                <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Log in</Text>
              </Pressable>
            </View>

            <Text style={styles.title}>{isSignUp ? 'Create your account' : 'Welcome back'}</Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Join Vicino and meet people actually near you.'
                : 'Sign in to continue discovering nearby.'}
            </Text>

            <View style={styles.fields}>
              <AuthField
                icon="mail-outline"
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <AuthField
                icon="lock-closed-outline"
                placeholder="Password (6+ characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <Button
              label={isSignUp ? 'Continue' : 'Sign in'}
              onPress={submit}
              loading={busy}
              disabled={!canSubmit}
              large
              style={styles.submitBtn}
            />

            <Text style={styles.legal}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const HEADER_HEIGHT = 220;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.black },
  photoHeader: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  backBtn: { alignSelf: 'flex-start' },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  sheetWrap: {
    flex: 1,
    marginTop: -28,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...shadows.float,
  },
  sheetScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.glassStrong,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: radii.full,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: radii.full,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textMuted,
  },
  tabTextActive: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  fields: { gap: spacing.sm },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 54,
  },
  fieldFocused: {
    borderColor: colors.rose,
    backgroundColor: colors.roseSoft,
  },
  fieldIcon: { marginRight: spacing.sm },
  fieldInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    paddingVertical: Platform.OS === 'web' ? 12 : 14,
  },
  eyeBtn: { padding: 4 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,59,48,0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    marginTop: spacing.md,
  },
  error: {
    flex: 1,
    color: colors.danger,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
  },
  submitBtn: { marginTop: spacing.lg, width: '100%' },
  legal: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
