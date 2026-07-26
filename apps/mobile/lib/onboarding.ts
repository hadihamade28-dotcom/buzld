import type { Href } from 'expo-router';

export const ONBOARDING_STEPS = [
  'name-birthday',
  'gender',
  'seeking',
  'intent',
  'photos',
  'interests',
  'lifestyle',
  'flash',
  'height-prompt',
  'permissions',
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEPS)[number];

export const ONBOARDING_TOTAL = ONBOARDING_STEPS.length;

export function stepIndex(step: string | null | undefined): number {
  if (!step) return 0;
  const idx = ONBOARDING_STEPS.indexOf(step as OnboardingStepId);
  return idx >= 0 ? idx : 0;
}

export function stepRoute(step: OnboardingStepId | string | null | undefined): Href {
  const id = (step && ONBOARDING_STEPS.includes(step as OnboardingStepId)
    ? step
    : 'name-birthday') as OnboardingStepId;
  return `/(onboarding)/${id}` as Href;
}

export function nextStep(current: OnboardingStepId): OnboardingStepId | null {
  const idx = ONBOARDING_STEPS.indexOf(current);
  if (idx < 0 || idx >= ONBOARDING_STEPS.length - 1) return null;
  return ONBOARDING_STEPS[idx + 1];
}

export function progressFor(step: OnboardingStepId): { step: number; total: number } {
  return { step: stepIndex(step) + 1, total: ONBOARDING_TOTAL };
}

/** Curated consented flash-round samples (Unsplash portraits). */
export const FLASH_SAMPLES: { id: string; url: string }[] = [
  { id: 'f1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=800&q=80' },
  { id: 'f2', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&h=800&q=80' },
  { id: 'f3', url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&h=800&q=80' },
  { id: 'f4', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=800&q=80' },
  { id: 'f5', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&h=800&q=80' },
  { id: 'f6', url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&h=800&q=80' },
  { id: 'f7', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&h=800&q=80' },
  { id: 'f8', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=800&q=80' },
];

export const AUTO_ADVANCE_MS = 250;
