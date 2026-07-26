import * as Crypto from 'expo-crypto';

import { uploadProfilePhoto } from './photos';
import { supabase } from './supabase';
import type {
  CandidatePeer,
  PhysicalPrefs,
  Profile,
  RevealedPeer,
} from './types';

function requireClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to apps/mobile/.env',
    );
  }
  return supabase;
}

async function requireUserId(): Promise<string> {
  const client = requireClient();
  const { data } = await client.auth.getUser();
  if (!data.user) throw new Error('Not signed in');
  return data.user.id;
}

export const api = {
  async signUp(email: string, password: string) {
    const client = requireClient();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data.user?.id ?? null;
  },

  async signIn(email: string, password: string) {
    const client = requireClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user?.id ?? null;
  },

  async signOut() {
    await requireClient().auth.signOut();
  },

  async getSessionUserId() {
    const client = requireClient();
    const { data } = await client.auth.getSession();
    return data.session?.user.id ?? null;
  },

  async getProfile(userId?: string) {
    const id = userId ?? (await requireUserId());
    const { data, error } = await requireClient()
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const row = data as Profile;
    return {
      ...row,
      lifestyle: row.lifestyle ?? {},
      profile_gaps: row.profile_gaps ?? [],
      age_min: row.age_min ?? 18,
      age_max: row.age_max ?? 99,
      consent_behavioral: row.consent_behavioral ?? false,
      consent_photo_analysis: row.consent_photo_analysis ?? false,
      photo_urls: row.photo_urls ?? [],
    } as Profile;
  },

  async updateProfile(patch: Partial<Profile>) {
    const id = await requireUserId();
    const { data, error } = await requireClient()
      .from('profiles')
      .upsert({ ...patch, id })
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async uploadPhoto(localUri: string, slot = 0) {
    const id = await requireUserId();
    return uploadProfilePhoto(id, localUri, slot);
  },

  async logOnboardingEvent(step: string, action: string, meta: Record<string, unknown> = {}) {
    const id = await requireUserId();
    const { error } = await requireClient().from('onboarding_events').insert({
      user_id: id,
      step,
      action,
      meta,
    });
    if (error) throw error;
  },

  async advanceOnboarding(step: string, patch: Partial<Profile> = {}) {
    const profile = await this.updateProfile({
      ...patch,
      onboarding_step: step,
    });
    await this.logOnboardingEvent(step, 'answer', { fields: Object.keys(patch) }).catch(() => undefined);
    return profile;
  },

  async skipOnboardingGap(step: string, gap: string) {
    const id = await requireUserId();
    const current = await this.getProfile(id);
    const gaps = Array.from(new Set([...(current?.profile_gaps ?? []), gap]));
    const profile = await this.updateProfile({
      profile_gaps: gaps,
      onboarding_step: step,
    });
    await this.logOnboardingEvent(step, 'skip', { gap }).catch(() => undefined);
    return profile;
  },

  async saveFlashResponse(sampleId: string, liked: boolean) {
    const id = await requireUserId();
    const { error } = await requireClient().from('flash_round_responses').upsert({
      user_id: id,
      sample_id: sampleId,
      liked,
    });
    if (error) throw error;
  },

  async clearProfileGap(gap: string) {
    const id = await requireUserId();
    const current = await this.getProfile(id);
    const gaps = (current?.profile_gaps ?? []).filter((g) => g !== gap);
    return this.updateProfile({ profile_gaps: gaps });
  },

  async getInterests(userId?: string) {
    const id = userId ?? (await requireUserId());
    const { data, error } = await requireClient()
      .from('profile_interests')
      .select('interest')
      .eq('user_id', id);
    if (error) throw error;
    return (data ?? []).map((r) => r.interest as string);
  },

  async setInterests(interests: string[]) {
    const id = await requireUserId();
    const client = requireClient();
    await client.from('profile_interests').delete().eq('user_id', id);
    if (interests.length) {
      const { error } = await client.from('profile_interests').insert(
        interests.map((interest) => ({ user_id: id, interest })),
      );
      if (error) throw error;
    }
  },

  async getPrefs(userId?: string) {
    const id = userId ?? (await requireUserId());
    const { data, error } = await requireClient()
      .from('physical_prefs')
      .select('*')
      .eq('user_id', id)
      .maybeSingle();
    if (error) throw error;
    return data as PhysicalPrefs | null;
  },

  async setPrefs(prefs: Partial<PhysicalPrefs>) {
    const id = await requireUserId();
    const { data, error } = await requireClient()
      .from('physical_prefs')
      .upsert({ ...prefs, user_id: id })
      .select()
      .single();
    if (error) throw error;
    return data as PhysicalPrefs;
  },

  async makeBleToken(userId: string) {
    const slice = userId.replace(/-/g, '').slice(0, 8);
    const salt = (
      await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${userId}:${Date.now()}`)
    ).slice(0, 6);
    return `vp_${slice}${salt}`;
  },

  async upsertPresence(lat: number, lng: number, ble_token: string) {
    await requireUserId();
    const { data, error } = await requireClient().rpc('upsert_presence', {
      p_lat: lat,
      p_lng: lng,
      p_ble_token: ble_token,
    });
    if (error) throw error;
    return data;
  },

  async findCandidates(): Promise<CandidatePeer[]> {
    await requireUserId();
    const { data, error } = await requireClient().functions.invoke('find-candidates');
    if (error) throw error;
    return (data?.candidates ?? []) as CandidatePeer[];
  },

  async reportSighting(bleToken: string): Promise<RevealedPeer | null> {
    await requireUserId();
    const { data, error } = await requireClient().functions.invoke('confirm-proximity', {
      body: { ble_token: bleToken },
    });
    if (error) throw error;
    return (data?.reveal ?? null) as RevealedPeer | null;
  },

  async getRevealedMatches() {
    await requireUserId();
    const { data, error } = await requireClient().rpc('get_revealed_matches');
    if (error) throw error;
    return (data ?? []) as RevealedPeer[];
  },

  async recordAction(matchId: string, action: 'continue' | 'pass') {
    await requireUserId();
    const { data, error } = await requireClient().rpc('record_match_action', {
      p_match_id: matchId,
      p_action: action,
    });
    if (error) throw error;
    return data as { match: unknown; conversation_id: string | null };
  },

  async listConversations() {
    await requireUserId();
    const { data, error } = await requireClient().rpc('list_conversations');
    if (error) throw error;
    return data ?? [];
  },

  async getMessages(conversationId: string) {
    const { data, error } = await requireClient()
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId: string, body: string) {
    const id = await requireUserId();
    const { data, error } = await requireClient()
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: id, body })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
