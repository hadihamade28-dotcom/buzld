import { useEffect } from 'react';

import { api } from './api';
import { supabase } from './supabase';
import type { Message, RevealedPeer } from './types';

/**
 * Subscribe to nearby_matches updates for the signed-in user (Supabase Realtime).
 */
export function useMatchRealtime(onReveal: (r: RevealedPeer) => void) {
  useEffect(() => {
    if (!supabase) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const userId = await api.getSessionUserId();
      if (!userId || !supabase) return;

      channel = supabase
        .channel(`matches:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'nearby_matches',
          },
          async (payload) => {
            const row = payload.new as {
              id: string;
              status: string;
              user_a: string;
              user_b: string;
            };
            if (row.status !== 'ble_confirmed') return;
            if (row.user_a !== userId && row.user_b !== userId) return;
            const reveals = await api.getRevealedMatches();
            const hit = reveals.find((r) => r.match.id === row.id);
            if (hit) onReveal(hit);
          },
        )
        .subscribe();
    })();

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [onReveal]);
}

/** Live message updates for a conversation. */
export function useChatRealtime(conversationId: string | undefined, onMessage: (m: Message) => void) {
  useEffect(() => {
    if (!supabase || !conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        },
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [conversationId, onMessage]);
}
