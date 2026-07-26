import { Platform, Vibration } from 'react-native';

/**
 * Deterministic vibration pattern from a shared seed (match haptic_seed).
 * Both phones play the same rhythm so the buzz is a shared signal nearby.
 */
export function patternFromSeed(seed: string): number[] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const pulses = 3 + (hash % 3); // 3–5 pulses
  const pattern: number[] = [0]; // start immediately

  for (let i = 0; i < pulses; i++) {
    const on = 80 + ((hash >> (i * 3)) % 5) * 40; // 80–240ms
    const off = 60 + ((hash >> (i * 5)) % 4) * 50; // 60–210ms
    pattern.push(on);
    if (i < pulses - 1) pattern.push(off);
  }

  return pattern;
}

export function playMatchBuzz(seed: string): void {
  const pattern = patternFromSeed(seed);
  if (Platform.OS === 'web') {
    console.log('[vicino] haptic pattern', pattern);
    return;
  }
  Vibration.vibrate(pattern);
}

/** Short tick for onboarding auto-advance momentum. */
export function playTick(): void {
  if (Platform.OS === 'web') return;
  Vibration.vibrate(12);
}

export function cancelBuzz(): void {
  Vibration.cancel();
}
