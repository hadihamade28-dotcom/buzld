import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { api } from './api';
import { registerForPushNotifications } from './notifications';
import { isSupabaseConfigured, supabase } from './supabase';
import type { PhysicalPrefs, Profile } from './types';

type AuthState = {
  loading: boolean;
  userId: string | null;
  profile: Profile | null;
  interests: string[];
  prefs: PhysicalPrefs | null;
  refresh: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<PhysicalPrefs | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const id = await api.getSessionUserId();
    setUserId(id);
    if (!id) {
      setProfile(null);
      setInterests([]);
      setPrefs(null);
      return;
    }
    const [p, i, pr] = await Promise.all([
      api.getProfile(id),
      api.getInterests(id),
      api.getPrefs(id),
    ]);
    setProfile(p);
    setInterests(i);
    setPrefs(pr);

    if (id) {
      registerForPushNotifications().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await api.signIn(email.trim().toLowerCase(), password);
      await refresh();
    },
    [refresh],
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      await api.signUp(email.trim().toLowerCase(), password);
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await api.signOut();
    setUserId(null);
    setProfile(null);
    setInterests([]);
    setPrefs(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      userId,
      profile,
      interests,
      prefs,
      refresh,
      signIn,
      signUp,
      signOut,
    }),
    [loading, userId, profile, interests, prefs, refresh, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
