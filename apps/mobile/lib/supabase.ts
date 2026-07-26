import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(
  url &&
    anon &&
    !url.includes('your-project') &&
    !url.includes('YOUR_PROJECT'),
);

/** Avoid `window is not defined` during Expo Router web SSR. */
const isBrowser = typeof window !== 'undefined';
const ssrMemory = new Map<string, string>();

const authStorage = {
  getItem: (key: string) =>
    isBrowser ? AsyncStorage.getItem(key) : Promise.resolve(ssrMemory.get(key) ?? null),
  setItem: (key: string, value: string) => {
    if (isBrowser) return AsyncStorage.setItem(key, value);
    ssrMemory.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (isBrowser) return AsyncStorage.removeItem(key);
    ssrMemory.delete(key);
    return Promise.resolve();
  },
};

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url, anon, {
      auth: {
        storage: authStorage,
        autoRefreshToken: isBrowser,
        persistSession: isBrowser,
        detectSessionInUrl: false,
      },
    })
  : null;
