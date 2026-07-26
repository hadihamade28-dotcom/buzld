import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View, type ViewProps, type ViewStyle } from 'react-native';

import { colors, layout } from '@/constants/theme';

/** Full-screen on phones; centered phone frame on desktop web only. */
export function MobileShell({ children, style, ...rest }: ViewProps) {
  const { width, height } = useWindowDimensions();
  const desktopPreview = Platform.OS === 'web' && width >= 520;

  if (!desktopPreview) {
    return (
      <View style={[styles.fullScreen, style]} {...rest}>
        {children}
      </View>
    );
  }

  const frameHeight = Math.min(height - 56, 896);

  return (
    <View style={styles.webOuter}>
      <View style={[styles.webFrame, { height: frameHeight, maxHeight: frameHeight }, style]} {...rest}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.bg,
    ...(Platform.OS === 'web'
      ? {
          height: '100dvh' as unknown as number,
          maxHeight: '100dvh' as unknown as number,
          overflow: 'hidden',
        }
      : {}),
  },
  webOuter: {
    flex: 1,
    width: '100%',
    minHeight: '100dvh' as unknown as number,
    backgroundColor: '#121214',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  webFrame: {
    width: '100%',
    maxWidth: layout.mobileMaxWidth,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    borderRadius: 44,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 32px 90px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        }
      : {}),
  } as ViewStyle,
});
