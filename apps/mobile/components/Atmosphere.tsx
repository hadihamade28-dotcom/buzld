import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';

function PulseRing({ delay }: { delay: number }) {
  const scale = useSharedValue(0.55);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1.4, { duration: 3000, easing: Easing.out(Easing.cubic) }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(0, { duration: 3000, easing: Easing.out(Easing.quad) }), -1, false),
    );
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, style]} />;
}

export function AtmosphericBackground({
  children,
  pulse,
  style,
  contentStyle,
  ...rest
}: ViewProps & { pulse?: boolean; contentStyle?: ViewProps['style'] }) {
  return (
    <View style={[styles.root, style]} {...rest}>
      <LinearGradient
        colors={['#060C14', '#0C1522', '#121E30', '#080F18']}
        locations={[0, 0.3, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(255,107,138,0.12)', 'transparent', 'rgba(244,162,97,0.08)']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 0.9 }}
        style={StyleSheet.absoluteFill}
      />
      {pulse ? (
        <View pointerEvents="none" style={styles.pulseWrap}>
          <PulseRing delay={0} />
          <PulseRing delay={1000} />
          <PulseRing delay={2000} />
        </View>
      ) : null}
      <SafeAreaView style={[styles.safe, contentStyle]}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  pulseWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1.5,
    borderColor: 'rgba(255,107,138,0.45)',
  },
});
