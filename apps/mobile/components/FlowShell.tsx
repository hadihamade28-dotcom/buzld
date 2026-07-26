import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarketingBackground } from '@/components/MarketingBackground';
import { colors, shadows, spacing } from '@/constants/theme';

type FlowShellProps = {
  /** Photo strip at top (login / onboarding style) */
  photo?: boolean;
  headerHeight?: number;
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  sheetStyle?: ViewStyle;
  showHandle?: boolean;
};

/** Photo header + white bottom sheet — matches auth landing / login. */
export function FlowShell({
  photo = true,
  headerHeight = 168,
  header,
  children,
  footer,
  scroll = true,
  keyboard = false,
  sheetStyle,
  showHandle,
}: FlowShellProps) {
  const insets = useSafeAreaInsets();
  const handleVisible = showHandle ?? photo;

  const sheet = (
    <View
      style={[
        styles.sheet,
        { paddingBottom: Math.max(insets.bottom, spacing.md) + (footer ? 0 : spacing.md) },
        sheetStyle,
      ]}
    >
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          contentContainerStyle={styles.sheetScroll}
        >
          {handleVisible ? <View style={styles.handle} /> : null}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.sheetScroll, { flex: 1 }]}>
          {handleVisible ? <View style={styles.handle} /> : null}
          {children}
        </View>
      )}
      {footer}
    </View>
  );

  const body = photo ? (
    <View style={styles.root}>
      <View style={[styles.photoHeader, { height: headerHeight }]}>
        <MarketingBackground variant="hero" />
        {header ? (
          <View style={[styles.photoOverlay, { paddingTop: insets.top + spacing.sm }]}>{header}</View>
        ) : null}
      </View>
      <View style={styles.sheetWrap}>{sheet}</View>
    </View>
  ) : (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.sheetWrap, { marginTop: 0, flex: 1 }]}>
        <View style={{ paddingTop: insets.top }} />
        {sheet}
      </View>
    </View>
  );

  if (keyboard) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return <View style={styles.flex}>{body}</View>;
}

/** Standard in-app screen: soft gray bg + safe area + horizontal padding. */
export function AppScreen({
  children,
  padded = true,
  style,
}: {
  children: React.ReactNode;
  padded?: boolean;
  style?: ViewStyle;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.appRoot, style]}>
      <View style={{ paddingTop: insets.top, flex: 1, paddingHorizontal: padded ? spacing.lg : 0 }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, backgroundColor: colors.black },
  appRoot: { flex: 1, backgroundColor: colors.bg },
  photoHeader: { overflow: 'hidden' },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  sheetWrap: { flex: 1, marginTop: -24 },
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
});
