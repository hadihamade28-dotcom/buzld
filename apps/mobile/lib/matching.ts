import type { Gender, PhysicalPrefs, Profile, Seeking } from './types';

function genderMatchesSeeking(gender: Gender | null, seeking: Seeking | null): boolean {
  if (!gender || !seeking) return false;
  if (seeking === 'everyone') return true;
  return gender === seeking;
}

export function reciprocalSeeking(a: Profile, b: Profile): boolean {
  return (
    genderMatchesSeeking(b.gender, a.seeking) && genderMatchesSeeking(a.gender, b.seeking)
  );
}

export function interestOverlapScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  const overlap = a.filter((x) => setB.has(x)).length;
  const denom = Math.max(a.length, b.length);
  return overlap / denom;
}

export function physicalOverlapScore(
  aPrefs: PhysicalPrefs | null,
  bPrefs: PhysicalPrefs | null,
): number {
  if (!aPrefs || !bPrefs) return 0.3; // mild default when prefs incomplete
  const aTags = new Set([...(aPrefs.style_tags ?? []), ...(aPrefs.looking_for_tags ?? [])]);
  const bTags = [...(bPrefs.style_tags ?? []), ...(bPrefs.looking_for_tags ?? [])];
  if (!aTags.size || !bTags.length) return 0.3;
  const hit = bTags.filter((t) => aTags.has(t)).length;
  return Math.min(1, hit / Math.max(3, Math.min(aTags.size, bTags.length)));
}

/** Weighted 0–1 score. Threshold for candidate: 0.35 */
export function compatibilityScore(
  a: Profile,
  b: Profile,
  aInterests: string[],
  bInterests: string[],
  aPrefs: PhysicalPrefs | null,
  bPrefs: PhysicalPrefs | null,
): number {
  if (!reciprocalSeeking(a, b)) return 0;
  const interests = interestOverlapScore(aInterests, bInterests);
  const physical = physicalOverlapScore(aPrefs, bPrefs);
  return 0.55 * interests + 0.45 * physical;
}

export const COMPAT_THRESHOLD = 0.35;
