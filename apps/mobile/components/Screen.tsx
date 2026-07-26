import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MarketingBackground } from '@/components/MarketingBackground';
import { colors, gradients, spacing } from '@/constants/theme';

type Props = ViewProps & {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  padded?: boolean;
  gradient?: boolean;
};

export function Screen({ children, style, edges, padded = true, gradient = false, ...rest }: Props) {
  return (
    <View style={[styles.root, style]} {...rest}>
      {gradient ? <LinearGradient colors={[...gradients.screen]} style={StyleSheet.absoluteFill} /> : null}
      <SafeAreaView edges={edges ?? ['top']} style={[styles.safe, padded && styles.padded]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

export function HeroScreen({ children, style, photo, ...rest }: ViewProps & { photo?: boolean }) {
  return (
    <View style={[styles.root, style]} {...rest}>
      {photo ? (
        <MarketingBackground variant="hero" light />
      ) : (
        <LinearGradient colors={[...gradients.hero]} style={StyleSheet.absoluteFill} />
      )}
      <SafeAreaView style={[styles.safe, styles.padded]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  padded: { paddingHorizontal: spacing.lg },
});
