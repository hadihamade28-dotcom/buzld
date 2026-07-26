import type { Href } from 'expo-router';

import type { Intent, Seeking } from './types';

export const ONBOARDING_STEPS = [
  'name-birthday',
  'gender',
  'seeking',
  'intent',
  'photos',
  'interests',
  'lifestyle',
  'flash',
  'looking-for',
  'height-range',
  'style',
  'permissions',
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_TOTAL = ONBOARDING_STEPS.length;

export function stepIndex(step: string | null | undefined): number {
  if (!step) return 0;
  if (step === 'height-prompt') return stepIndex('height-range');
  const idx = ONBOARDING_STEPS.indexOf(step as OnboardingStepId);
  return idx >= 0 ? idx : 0;
}

export function stepRoute(step: OnboardingStepId | string | null | undefined): Href {
  let id = step;
  if (id === 'height-prompt') id = 'height-range';
  const resolved = (id && ONBOARDING_STEPS.includes(id as OnboardingStepId)
    ? id
    : 'name-birthday') as OnboardingStepId;
  return `/(onboarding)/${resolved}` as Href;
}

export function nextStep(current: OnboardingStepId): OnboardingStepId | null {
  const idx = ONBOARDING_STEPS.indexOf(current);
  if (idx < 0 || idx >= ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[idx + 1];
}

export function progressFor(step: OnboardingStepId): { step: number; total: number } {
  return { step: stepIndex(step) + 1, total: ONBOARDING_TOTAL };
}

/** Short-horizon intents: flash round is required (appearance-weighted). */
export function flashRequired(intent: Intent | null | undefined): boolean {
  return intent === 'tonight' || intent === 'casual';
}

export type FlashAudience = 'women' | 'men' | 'mixed';

export function flashAudienceFromSeeking(seeking: Seeking | null | undefined): FlashAudience {
  if (seeking === 'woman') return 'women';
  if (seeking === 'man') return 'men';
  return 'mixed';
}

type FlashSample = { id: string; url: string; gender: 'woman' | 'man' };

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=800&q=80`;

/** Curated consented flash-round samples (Unsplash portraits), gendered. */
export const FLASH_SAMPLES_WOMEN: FlashSample[] = [
  { id: 'w1', gender: 'woman', url: u('photo-1534528741775-53994a69daeb') },
  { id: 'w2', gender: 'woman', url: u('photo-1529626455594-4ff0802cfb7e') },
  { id: 'w3', gender: 'woman', url: u('photo-1438761681033-6461ffad8d80') },
  { id: 'w4', gender: 'woman', url: u('photo-1531746020798-e6953c6e8e04') },
  { id: 'w5', gender: 'woman', url: u('photo-1494790108377-be9c29b29330') },
  { id: 'w6', gender: 'woman', url: u('photo-1524504388940-b1c17226555e') },
  { id: 'w7', gender: 'woman', url: u('photo-1488426862026-3ee34a7d66df') },
  { id: 'w8', gender: 'woman', url: u('photo-1544005313-94ddf0286df2') },
];

export const FLASH_SAMPLES_MEN: FlashSample[] = [
  { id: 'm1', gender: 'man', url: u('photo-1506794778202-cad84cf45f1d') },
  { id: 'm2', gender: 'man', url: u('photo-1507003211169-0a1dd7228f2d') },
  { id: 'm3', gender: 'man', url: u('photo-1500648767791-00dcc994a43e') },
  { id: 'm4', gender: 'man', url: u('photo-1492562080023-ab3db95bfbce') },
  { id: 'm5', gender: 'man', url: u('photo-1539571696357-5a69c17a67c6') },
  { id: 'm6', gender: 'man', url: u('photo-1504257432389-52343af06d62') },
  { id: 'm7', gender: 'man', url: u('photo-1519085360753-af0119f7cbe7') },
  { id: 'm8', gender: 'man', url: u('photo-1463453091185-61582044d556') },
];

/** @deprecated use flashSamplesFor — mixed pack for backwards compat */
export const FLASH_SAMPLES: FlashSample[] = [
  FLASH_SAMPLES_WOMEN[0],
  FLASH_SAMPLES_MEN[0],
  FLASH_SAMPLES_WOMEN[1],
  FLASH_SAMPLES_MEN[1],
  FLASH_SAMPLES_WOMEN[2],
  FLASH_SAMPLES_MEN[2],
  FLASH_SAMPLES_WOMEN[3],
  FLASH_SAMPLES_MEN[3],
];

export function flashSamplesFor(audience: FlashAudience): FlashSample[] {
  if (audience === 'women') return FLASH_SAMPLES_WOMEN;
  if (audience === 'men') return FLASH_SAMPLES_MEN;
  const mixed: FlashSample[] = [];
  for (let i = 0; i < 4; i++) {
    mixed.push(FLASH_SAMPLES_WOMEN[i], FLASH_SAMPLES_MEN[i]);
  }
  return mixed;
}

/** Look prefs that make sense for who they're matching. */
export function lookingForTagsFor(audience: FlashAudience): readonly string[] {
  if (audience === 'women') {
    return ['tall', 'petite', 'curvy', 'slim', 'tattoos', 'glasses'];
  }
  if (audience === 'men') {
    return ['tall', 'slim', 'beard', 'tattoos', 'glasses', 'athletic'];
  }
  return ['tall', 'petite', 'curvy', 'slim', 'beard', 'tattoos', 'glasses'];
}

/** Soft seeking height defaults by who they want to meet. */
export function defaultSeekHeightRange(
  audience: FlashAudience,
  selfCm = 170,
): { min: number; max: number } {
  if (audience === 'women') return { min: 155, max: 180 };
  if (audience === 'men') return { min: 170, max: 195 };
  return {
    min: Math.max(120, selfCm - 20),
    max: Math.min(230, selfCm + 20),
  };
}

export const AUTO_ADVANCE_MS = 250;

export const MAX_LOOKING_FOR_TAGS = 3;
export const MAX_STYLE_TAGS = 2;
