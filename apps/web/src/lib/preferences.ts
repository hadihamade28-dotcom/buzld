export type LookingFor = "women" | "men" | "nonbinary";
export type Intent = "dating" | "serious" | "casual" | "friends";

export type MatchPreferences = {
  lookingFor: LookingFor[];
  ageMin: number;
  ageMax: number;
  intents: Intent[];
};

export const LOOKING_FOR_OPTIONS: { id: LookingFor; label: string }[] = [
  { id: "women", label: "Women" },
  { id: "men", label: "Men" },
  { id: "nonbinary", label: "Non-binary" },
];

export const INTENT_OPTIONS: { id: Intent; label: string; hint: string }[] = [
  { id: "dating", label: "Dating", hint: "Open to meeting people" },
  { id: "serious", label: "Long-term", hint: "Looking for something lasting" },
  { id: "casual", label: "Casual", hint: "Keep it light" },
  { id: "friends", label: "Friends", hint: "New people nearby" },
];

export const AGE_FLOOR = 18;
export const AGE_CEILING = 99;

export const AGE_PRESETS: { label: string; ageMin: number; ageMax: number }[] = [
  { label: "18–24", ageMin: 18, ageMax: 24 },
  { label: "25–34", ageMin: 25, ageMax: 34 },
  { label: "35–44", ageMin: 35, ageMax: 44 },
  { label: "45–54", ageMin: 45, ageMax: 54 },
  { label: "55+", ageMin: 55, ageMax: 99 },
];

export const defaultPreferences: MatchPreferences = {
  lookingFor: ["women", "men"],
  ageMin: 23,
  ageMax: 35,
  intents: ["dating"],
};

const STORAGE_KEY = "buzld.matchPreferences";

export function loadPreferences(): MatchPreferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<MatchPreferences>;
    return {
      lookingFor: parsed.lookingFor?.length ? parsed.lookingFor : defaultPreferences.lookingFor,
      ageMin: clampAge(parsed.ageMin ?? defaultPreferences.ageMin),
      ageMax: clampAge(parsed.ageMax ?? defaultPreferences.ageMax),
      intents: parsed.intents?.length ? parsed.intents : defaultPreferences.intents,
    };
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(prefs: MatchPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePreferences(prefs)));
}

export function normalizePreferences(prefs: MatchPreferences): MatchPreferences {
  const ageMin = clampAge(Math.min(prefs.ageMin, prefs.ageMax));
  const ageMax = clampAge(Math.max(prefs.ageMin, prefs.ageMax));
  return {
    lookingFor: prefs.lookingFor.length ? prefs.lookingFor : [...defaultPreferences.lookingFor],
    ageMin,
    ageMax,
    intents: prefs.intents.length ? prefs.intents : [...defaultPreferences.intents],
  };
}

function clampAge(n: number) {
  return Math.min(AGE_CEILING, Math.max(AGE_FLOOR, Math.round(n)));
}

export function formatAgeRange(ageMin: number, ageMax: number) {
  if (ageMax >= AGE_CEILING) return `${ageMin}+`;
  if (ageMin === ageMax) return `${ageMin}`;
  return `${ageMin}–${ageMax}`;
}

export function formatLookingFor(lookingFor: LookingFor[]) {
  if (lookingFor.length === LOOKING_FOR_OPTIONS.length) return "Everyone";
  return lookingFor
    .map((id) => LOOKING_FOR_OPTIONS.find((o) => o.id === id)?.label ?? id)
    .join(", ");
}

export function formatIntents(intents: Intent[]) {
  return intents.map((id) => INTENT_OPTIONS.find((o) => o.id === id)?.label ?? id).join(", ");
}

export function formatPreferencesSummary(prefs: MatchPreferences) {
  return `${formatLookingFor(prefs.lookingFor)} · ${formatAgeRange(prefs.ageMin, prefs.ageMax)}`;
}
