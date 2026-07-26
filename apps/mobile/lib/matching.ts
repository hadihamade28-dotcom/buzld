import type { Intent, Lifestyle, Profile, Seeking, Gender, PhysicalPrefs, UserWeights } from './types';

export type ScoreWeights = {
  appearance: number;
  proximity: number;
  intent_align: number;
  interests: number;
  lifestyle: number;
  prompt_reliability: number;
};

export const COMPAT_THRESHOLD = 0.28;

const INTENT_PRESETS: Record<Intent, ScoreWeights> = {
  tonight: {
    appearance: 0.4,
    proximity: 0.25,
    intent_align: 0.15,
    interests: 0.08,
    lifestyle: 0.02,
    prompt_reliability: 0.1,
  },
  casual: {
    appearance: 0.3,
    proximity: 0.15,
    intent_align: 0.2,
    interests: 0.15,
    lifestyle: 0.1,
    prompt_reliability: 0.1,
  },
  open: {
    appearance: 0.3,
    proximity: 0.15,
    intent_align: 0.2,
    interests: 0.15,
    lifestyle: 0.1,
    prompt_reliability: 0.1,
  },
  dating: {
    appearance: 0.18,
    proximity: 0.07,
    intent_align: 0.2,
    interests: 0.2,
    lifestyle: 0.2,
    prompt_reliability: 0.15,
  },
  long_term: {
    appearance: 0.18,
    proximity: 0.07,
    intent_align: 0.2,
    interests: 0.2,
    lifestyle: 0.2,
    prompt_reliability: 0.15,
  },
};

export function weightsForIntent(intent: Intent | null | undefined): ScoreWeights {
  if (!intent) return INTENT_PRESETS.open;
  return INTENT_PRESETS[intent] ?? INTENT_PRESETS.open;
}

export function weightsFromRow(row: UserWeights | null | undefined, intent: Intent | null): ScoreWeights {
  if (!row) return weightsForIntent(intent);
  return {
    appearance: row.appearance,
    proximity: row.proximity,
    intent_align: row.intent_align,
    interests: row.interests,
    lifestyle: row.lifestyle,
    prompt_reliability: row.prompt_reliability,
  };
}

function genderMatchesSeeking(gender: Gender | null, seeking: Seeking | null): boolean {
  if (!gender || !seeking) return false;
  if (seeking === 'everyone') return true;
  return gender === seeking;
}

export function reciprocalSeeking(a: Profile, b: Profile): boolean {
  return genderMatchesSeeking(b.gender, a.seeking) && genderMatchesSeeking(a.gender, b.seeking);
}

export function ageFromBirthdate(birthdate: string | null | undefined, now = new Date()): number | null {
  if (!birthdate) return null;
  const d = new Date(birthdate);
  if (Number.isNaN(d.getTime())) return null;
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export function withinAgeBounds(viewer: Profile, candidate: Profile): boolean {
  const candidateAge = ageFromBirthdate(candidate.birthdate);
  const viewerAge = ageFromBirthdate(viewer.birthdate);
  if (candidateAge == null || viewerAge == null) return true; // incomplete profiles: don't hard-block yet
  const viewerOk = candidateAge >= (viewer.age_min ?? 18) && candidateAge <= (viewer.age_max ?? 99);
  const candidateOk = viewerAge >= (candidate.age_min ?? 18) && viewerAge <= (candidate.age_max ?? 99);
  return viewerOk && candidateOk;
}

export function interestOverlapScore(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  const overlap = a.filter((x) => setB.has(x)).length;
  return overlap / Math.max(a.length, b.length);
}

export function physicalOverlapScore(
  aPrefs: PhysicalPrefs | null,
  bPrefs: PhysicalPrefs | null,
): number {
  if (!aPrefs || !bPrefs) return 0.3;
  const outboundWant = aPrefs.looking_for_tags ?? [];
  const outboundHave = [...(bPrefs.style_tags ?? []), ...(bPrefs.looking_for_tags ?? [])];
  const inboundWant = bPrefs.looking_for_tags ?? [];
  const inboundHave = [...(aPrefs.style_tags ?? []), ...(aPrefs.looking_for_tags ?? [])];

  const scores: number[] = [];
  if (outboundWant.length && outboundHave.length) {
    const have = new Set(outboundHave);
    const hit = outboundWant.filter((t) => have.has(t)).length;
    scores.push(hit / outboundWant.length);
  }
  if (inboundWant.length && inboundHave.length) {
    const have = new Set(inboundHave);
    const hit = inboundWant.filter((t) => have.has(t)).length;
    scores.push(hit / inboundWant.length);
  }
  if (!scores.length) {
    // Shared taste / style bag fallback
    const aTags = new Set([...(aPrefs.style_tags ?? []), ...(aPrefs.looking_for_tags ?? [])]);
    const bTags = [...(bPrefs.style_tags ?? []), ...(bPrefs.looking_for_tags ?? [])];
    if (!aTags.size || !bTags.length) return 0.3;
    const hit = bTags.filter((t) => aTags.has(t)).length;
    return Math.min(1, hit / Math.max(3, Math.min(aTags.size, bTags.length)));
  }
  return scores.reduce((s, x) => s + x, 0) / scores.length;
}

/** Soft score: 1 inside seek range, falls off outside. */
export function heightRangeScore(
  candidateHeightCm: number | null | undefined,
  viewerPrefs: PhysicalPrefs | null,
): number {
  const min = viewerPrefs?.height_cm_min ?? null;
  const max = viewerPrefs?.height_cm_max ?? null;
  if (min == null && max == null) return 0.5;
  if (candidateHeightCm == null) return 0.4;
  const lo = min ?? 120;
  const hi = max ?? 230;
  if (candidateHeightCm >= lo && candidateHeightCm <= hi) return 1;
  const dist = candidateHeightCm < lo ? lo - candidateHeightCm : candidateHeightCm - hi;
  return Math.max(0, 1 - dist / 30);
}

/** Appearance proxy until photo embeddings (Phase 4). */
export function appearanceProxyScore(
  aPrefs: PhysicalPrefs | null,
  bPrefs: PhysicalPrefs | null,
  candidateHeightCm: number | null = null,
  flashAgreement: number | null = null,
): number {
  const tags = physicalOverlapScore(aPrefs, bPrefs);
  const height = heightRangeScore(candidateHeightCm, aPrefs);
  const hasHeightPrefs = aPrefs?.height_cm_min != null || aPrefs?.height_cm_max != null;
  const physical = hasHeightPrefs ? 0.45 * tags + 0.55 * height : tags;
  if (flashAgreement == null) return physical;
  return Math.min(1, 0.65 * physical + 0.35 * flashAgreement);
}

export function intentAlignmentScore(a: Intent | null, b: Intent | null): number {
  if (!a || !b) return 0.5;
  if (a === b) return 1;
  const short = new Set<Intent>(['tonight', 'casual']);
  const mid = new Set<Intent>(['open', 'dating']);
  const long = new Set<Intent>(['dating', 'long_term']);
  if ((short.has(a) && short.has(b)) || (mid.has(a) && mid.has(b)) || (long.has(a) && long.has(b))) {
    return 0.7;
  }
  // Mismatched intents are damped, not zeroed
  return 0.35;
}

export function lifestyleCompatibilityScore(a: Lifestyle | null | undefined, b: Lifestyle | null | undefined): number {
  const keys: (keyof Lifestyle)[] = ['drinks', 'smokes', 'gym', 'pets', 'kids_someday'];
  let compared = 0;
  let agree = 0;
  for (const key of keys) {
    const av = a?.[key];
    const bv = b?.[key];
    if (av == null || bv == null) continue;
    compared += 1;
    if (av === bv) agree += 1;
  }
  if (!compared) return 0.5;
  return agree / compared;
}

export function proximityScore(distanceM: number, radiusM: number, presenceAgeSec: number): number {
  const radius = Math.max(radiusM, 1);
  const distFactor = Math.max(0, 1 - distanceM / radius);
  // Fresher presence (< 2 min) scores higher
  const freshness = Math.max(0, 1 - presenceAgeSec / 600);
  return Math.min(1, 0.7 * distFactor + 0.3 * freshness);
}

export function promptAffinityScore(aPrompt: string | null | undefined, bPrompt: string | null | undefined): number {
  if (!aPrompt?.trim() || !bPrompt?.trim()) return 0.5;
  const aw = new Set(aPrompt.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
  const bw = bPrompt.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  if (!aw.size || !bw.length) return 0.5;
  const hit = bw.filter((w) => aw.has(w)).length;
  return Math.min(1, 0.4 + hit / Math.max(bw.length, 1));
}

export type ScoreBreakdown = {
  total: number;
  appearance: number;
  proximity: number;
  intent_align: number;
  interests: number;
  lifestyle: number;
  prompt_reliability: number;
};

export function compatibilityScore(args: {
  viewer: Profile;
  candidate: Profile;
  viewerInterests: string[];
  candidateInterests: string[];
  viewerPrefs: PhysicalPrefs | null;
  candidatePrefs: PhysicalPrefs | null;
  distanceM: number;
  presenceAgeSec: number;
  weights?: ScoreWeights | null;
  flashAgreement?: number | null;
  reliability?: number;
}): ScoreBreakdown {
  const { viewer, candidate } = args;
  if (!reciprocalSeeking(viewer, candidate)) {
    return {
      total: 0,
      appearance: 0,
      proximity: 0,
      intent_align: 0,
      interests: 0,
      lifestyle: 0,
      prompt_reliability: 0,
    };
  }
  if (!withinAgeBounds(viewer, candidate)) {
    return {
      total: 0,
      appearance: 0,
      proximity: 0,
      intent_align: 0,
      interests: 0,
      lifestyle: 0,
      prompt_reliability: 0,
    };
  }

  const w = args.weights ?? weightsForIntent(viewer.intent);
  const appearance = appearanceProxyScore(
    args.viewerPrefs,
    args.candidatePrefs,
    candidate.height_cm,
    args.flashAgreement ?? null,
  );
  const proximity = proximityScore(args.distanceM, viewer.radius_m || 150, args.presenceAgeSec);
  const intent_align = intentAlignmentScore(viewer.intent, candidate.intent);
  const interests = interestOverlapScore(args.viewerInterests, args.candidateInterests);
  const lifestyle = lifestyleCompatibilityScore(viewer.lifestyle, candidate.lifestyle);
  const prompt = promptAffinityScore(viewer.prompt ?? viewer.bio, candidate.prompt ?? candidate.bio);
  const reliability = args.reliability ?? 0.5;
  const prompt_reliability = Math.min(1, 0.5 * prompt + 0.5 * reliability);

  const total =
    w.appearance * appearance +
    w.proximity * proximity +
    w.intent_align * intent_align +
    w.interests * interests +
    w.lifestyle * lifestyle +
    w.prompt_reliability * prompt_reliability;

  return {
    total,
    appearance,
    proximity,
    intent_align,
    interests,
    lifestyle,
    prompt_reliability,
  };
}

/** Legacy helper kept for older call sites. */
export function legacyCompatibilityScore(
  a: Profile,
  b: Profile,
  aInterests: string[],
  bInterests: string[],
  aPrefs: PhysicalPrefs | null,
  bPrefs: PhysicalPrefs | null,
): number {
  return compatibilityScore({
    viewer: a,
    candidate: b,
    viewerInterests: aInterests,
    candidateInterests: bInterests,
    viewerPrefs: aPrefs,
    candidatePrefs: bPrefs,
    distanceM: 50,
    presenceAgeSec: 30,
  }).total;
}
