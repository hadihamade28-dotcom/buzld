export type Gender = 'woman' | 'man' | 'nonbinary' | 'other';
export type Seeking = Gender | 'everyone';

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
