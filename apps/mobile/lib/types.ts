export type Gender = 'woman' | 'man' | 'nonbinary' | 'other';
export type Seeking = Gender | 'everyone';
export type Intent = 'tonight' | 'casual' | 'open' | 'dating' | 'long_term';

export type Lifestyle = {
  drinks?: boolean | null;
  smokes?: boolean | null;
  gym?: boolean | null;
  pets?: boolean | null;
  kids_someday?: boolean | null;
};

export type MatchStatus =
  | 'candidate'
  | 'ble_confirmed'
  | 'continued'
  | 'passed'
  | 'mutual'
  | 'expired';

export type Profile = {
  id: string;
  display_name: string;
  bio: string | null;
  birthdate: string | null;
  gender: Gender | null;
  seeking: Seeking | null;
  intent: Intent | null;
  height_cm: number | null;
  lifestyle: Lifestyle;
  onboarding_step: string | null;
  profile_gaps: string[];
  age_min: number;
  age_max: number;
  consent_behavioral: boolean;
  consent_photo_analysis: boolean;
  prompt: string | null;
  photo_urls: string[];
  discovery_enabled: boolean;
  radius_m: number;
  onboarding_complete: boolean;
  last_seen_at: string | null;
  created_at?: string;
};

export type PhysicalPrefs = {
  user_id: string;
  height_cm_min: number | null;
  height_cm_max: number | null;
  style_tags: string[];
  looking_for_tags: string[];
};

export type UserWeights = {
  user_id: string;
  intent: Intent | null;
  appearance: number;
  proximity: number;
  intent_align: number;
  interests: number;
  lifestyle: number;
  prompt_reliability: number;
  updated_at: string;
};

export type Presence = {
  user_id: string;
  lat: number;
  lng: number;
  geohash: string;
  ble_token: string;
  updated_at: string;
};

export type NearbyMatch = {
  id: string;
  user_a: string;
  user_b: string;
  status: MatchStatus;
  haptic_seed: string;
  score: number;
  created_at: string;
  updated_at: string;
};

export type MatchAction = {
  match_id: string;
  user_id: string;
  action: 'continue' | 'pass';
};

export type Conversation = {
  id: string;
  match_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type CandidatePeer = {
  user_id: string;
  ble_token: string;
  score: number;
  distance_m: number;
};

export type RevealedPeer = {
  match: NearbyMatch;
  peer: Pick<Profile, 'id' | 'display_name' | 'photo_urls' | 'bio'>;
};

export const INTEREST_CATALOG = [
  'coffee',
  'nightlife',
  'hiking',
  'art',
  'music',
  'food',
  'fitness',
  'travel',
  'film',
  'books',
  'gaming',
  'dogs',
  'cats',
  'photography',
  'dancing',
  'comedy',
] as const;

export const STYLE_TAGS = [
  'casual',
  'athletic',
  'creative',
  'polished',
  'alt',
  'street',
] as const;

export const LOOKING_FOR_TAGS = [
  'tall',
  'petite',
  'curvy',
  'slim',
  'beard',
  'tattoos',
  'glasses',
] as const;

export const INTENT_OPTIONS: { id: Intent; label: string; hint: string }[] = [
  { id: 'tonight', label: 'Tonight', hint: 'Out now — keep it spontaneous' },
  { id: 'casual', label: 'Casual', hint: 'Low pressure, see what happens' },
  { id: 'open', label: 'Open', hint: 'Figuring it out as I go' },
  { id: 'dating', label: 'Dating', hint: 'Looking to meet someone' },
  { id: 'long_term', label: 'Long-term', hint: 'Building something real' },
];

export const LIFESTYLE_CARDS: {
  key: keyof Lifestyle;
  label: string;
  yes: string;
  no: string;
}[] = [
  { key: 'drinks', label: 'Do you drink?', yes: 'Yes', no: 'No' },
  { key: 'smokes', label: 'Do you smoke?', yes: 'Yes', no: 'No' },
  { key: 'gym', label: 'Do you work out?', yes: 'Yes', no: 'Rarely' },
  { key: 'pets', label: 'Pets?', yes: 'Love them', no: 'Not really' },
  { key: 'kids_someday', label: 'Kids someday?', yes: 'Yes', no: 'No' },
];

export const PROFILE_GAP_COPY: Record<string, string> = {
  interests: 'Add interests — profiles with them get more relevant buzzes',
  lifestyle: 'Answer a few lifestyle cards — better lifestyle matches',
  flash: 'Do the “your type” round — seeds better visual matches',
  height: 'Add your height — 2× more matches mention it',
  prompt: 'Add a prompt — people message more when there’s a hook',
};
