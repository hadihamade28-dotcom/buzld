export type LookingFor = "women" | "men" | "nonbinary";
export type Intent = "dating" | "serious" | "casual" | "friends";

export type StyleTag = "casual" | "athletic" | "creative" | "polished" | "alt" | "street";
export type LookingForTag =
  | "tall"
  | "petite"
  | "curvy"
  | "slim"
  | "beard"
  | "tattoos"
  | "glasses"
  | "athletic";

export type FlashAudience = "women" | "men" | "mixed";

export type MatchPreferences = {
  lookingFor: LookingFor[];
  ageMin: number;
  ageMax: number;
  intents: Intent[];
};

/** Physical / appearance signals used for matching (mock web). */
export type PhysicalLooks = {
  flashVotes: { id: string; liked: boolean }[];
  lookingForTags: LookingForTag[];
  styleTags: StyleTag[];
  heightCm: number;
  heightMin: number;
  heightMax: number;
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

export const LOOKING_FOR_TAGS: { id: LookingForTag; label: string }[] = [
  { id: "tall", label: "Tall" },
  { id: "petite", label: "Petite" },
  { id: "curvy", label: "Curvy" },
  { id: "slim", label: "Slim" },
  { id: "beard", label: "Beard" },
  { id: "tattoos", label: "Tattoos" },
  { id: "glasses", label: "Glasses" },
  { id: "athletic", label: "Athletic" },
];

export const STYLE_TAGS: { id: StyleTag; label: string }[] = [
  { id: "casual", label: "Casual" },
  { id: "athletic", label: "Athletic" },
  { id: "creative", label: "Creative" },
  { id: "polished", label: "Polished" },
  { id: "alt", label: "Alt" },
  { id: "street", label: "Street" },
];

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=800&q=80`;

export const FLASH_SAMPLES_WOMEN: { id: string; url: string }[] = [
  { id: "w1", url: u("photo-1534528741775-53994a69daeb") },
  { id: "w2", url: u("photo-1529626455594-4ff0802cfb7e") },
  { id: "w3", url: u("photo-1438761681033-6461ffad8d80") },
  { id: "w4", url: u("photo-1531746020798-e6953c6e8e04") },
  { id: "w5", url: u("photo-1494790108377-be9c29b29330") },
  { id: "w6", url: u("photo-1524504388940-b1c17226555e") },
  { id: "w7", url: u("photo-1488426862026-3ee34a7d66df") },
  { id: "w8", url: u("photo-1544005313-94ddf0286df2") },
];

export const FLASH_SAMPLES_MEN: { id: string; url: string }[] = [
  { id: "m1", url: u("photo-1506794778202-cad84cf45f1d") },
  { id: "m2", url: u("photo-1507003211169-0a1dd7228f2d") },
  { id: "m3", url: u("photo-1500648767791-00dcc994a43e") },
  { id: "m4", url: u("photo-1492562080023-ab3db95bfbce") },
  { id: "m5", url: u("photo-1539571696357-5a69c17a67c6") },
  { id: "m6", url: u("photo-1504257432389-52343af06d62") },
  { id: "m7", url: u("photo-1519085360753-af0119f7cbe7") },
  { id: "m8", url: u("photo-1463453091185-61582044d556") },
];

/** @deprecated prefer flashSamplesFor */
export const FLASH_SAMPLES = [
  FLASH_SAMPLES_WOMEN[0],
  FLASH_SAMPLES_MEN[0],
  FLASH_SAMPLES_WOMEN[1],
  FLASH_SAMPLES_MEN[1],
  FLASH_SAMPLES_WOMEN[2],
  FLASH_SAMPLES_MEN[2],
  FLASH_SAMPLES_WOMEN[3],
  FLASH_SAMPLES_MEN[3],
];

export function flashAudienceFromLookingFor(lookingFor: LookingFor[]): FlashAudience {
  const wantsWomen = lookingFor.includes("women");
  const wantsMen = lookingFor.includes("men");
  if (wantsWomen && !wantsMen) return "women";
  if (wantsMen && !wantsWomen) return "men";
  return "mixed";
}

export function flashSamplesFor(audience: FlashAudience) {
  if (audience === "women") return FLASH_SAMPLES_WOMEN;
  if (audience === "men") return FLASH_SAMPLES_MEN;
  const mixed: { id: string; url: string }[] = [];
  for (let i = 0; i < 4; i++) {
    mixed.push(FLASH_SAMPLES_WOMEN[i], FLASH_SAMPLES_MEN[i]);
  }
  return mixed;
}

export function lookingForTagsFor(audience: FlashAudience): { id: LookingForTag; label: string }[] {
  const ids: LookingForTag[] =
    audience === "women"
      ? ["tall", "petite", "curvy", "slim", "tattoos", "glasses"]
      : audience === "men"
        ? ["tall", "slim", "beard", "tattoos", "glasses", "athletic"]
        : ["tall", "petite", "curvy", "slim", "beard", "tattoos", "glasses"];
  return ids.map((id) => LOOKING_FOR_TAGS.find((t) => t.id === id)!).filter(Boolean);
}

export function defaultSeekHeightRange(audience: FlashAudience, selfCm = 170) {
  if (audience === "women") return { min: 155, max: 180 };
  if (audience === "men") return { min: 170, max: 195 };
  return { min: Math.max(120, selfCm - 20), max: Math.min(230, selfCm + 20) };
}

export const AGE_FLOOR = 18;
export const AGE_CEILING = 99;
export const MAX_LOOKING_FOR_TAGS = 3;
export const MAX_STYLE_TAGS = 2;

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

export const emptyPhysicalLooks = (audience: FlashAudience = "mixed"): PhysicalLooks => {
  const range = defaultSeekHeightRange(audience);
  return {
    flashVotes: [],
    lookingForTags: [],
    styleTags: [],
    heightCm: 170,
    heightMin: range.min,
    heightMax: range.max,
  };
};

const STORAGE_KEY = "buzld.matchPreferences";
const LOOKS_KEY = "buzld.physicalLooks";

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

export function loadPhysicalLooks(): PhysicalLooks {
  if (typeof window === "undefined") return emptyPhysicalLooks();
  try {
    const raw = window.localStorage.getItem(LOOKS_KEY);
    if (!raw) return emptyPhysicalLooks();
    const parsed = JSON.parse(raw) as Partial<PhysicalLooks>;
    return normalizePhysicalLooks({ ...emptyPhysicalLooks(), ...parsed });
  } catch {
    return emptyPhysicalLooks();
  }
}

export function savePhysicalLooks(looks: PhysicalLooks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOOKS_KEY, JSON.stringify(normalizePhysicalLooks(looks)));
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

export function normalizePhysicalLooks(looks: PhysicalLooks): PhysicalLooks {
  const heightCm = clampHeight(looks.heightCm);
  const heightMin = clampHeight(Math.min(looks.heightMin, looks.heightMax));
  const heightMax = clampHeight(Math.max(looks.heightMin, looks.heightMax));
  return {
    flashVotes: looks.flashVotes ?? [],
    lookingForTags: (looks.lookingForTags ?? []).slice(0, MAX_LOOKING_FOR_TAGS),
    styleTags: (looks.styleTags ?? []).slice(0, MAX_STYLE_TAGS),
    heightCm,
    heightMin,
    heightMax,
  };
}

export function physicalLooksComplete(looks: PhysicalLooks, audience: FlashAudience = "mixed") {
  const needed = flashSamplesFor(audience).length;
  return (
    looks.flashVotes.length >= needed &&
    looks.lookingForTags.length > 0 &&
    looks.styleTags.length > 0 &&
    looks.heightCm >= 120 &&
    looks.heightMin <= looks.heightMax
  );
}

function clampAge(n: number) {
  return Math.min(AGE_CEILING, Math.max(AGE_FLOOR, Math.round(n)));
}

function clampHeight(n: number) {
  return Math.min(230, Math.max(120, Math.round(n)));
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

export function formatLooksSummary(looks: PhysicalLooks) {
  const tags = [
    ...looks.lookingForTags.map((id) => LOOKING_FOR_TAGS.find((t) => t.id === id)?.label ?? id),
    ...looks.styleTags.map((id) => STYLE_TAGS.find((t) => t.id === id)?.label ?? id),
  ];
  return `${looks.heightCm}cm · seek ${looks.heightMin}–${looks.heightMax} · ${tags.slice(0, 3).join(", ") || "looks set"}`;
}
