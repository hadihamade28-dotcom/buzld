import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MatchReveal } from '@/components/MatchReveal';
import { AppScreen } from '@/components/FlowShell';
import { EmptyState, ListCard, ListDivider, ListRow, MatchAvatarRow, SectionLabel } from '@/components/ui';
import { colors, fonts, layout, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import type { RevealedPeer } from '@/lib/types';

type Row = {
  conversation: { id: string };
  peer: { display_name: string; photo_urls: string[] };
  match: { status: string };
};

export default function MatchesScreen() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [revealed, setRevealed] = useState<RevealedPeer[]>([]);
  const [activeReveal, setActiveReveal] = useState<RevealedPeer | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [convos, reveals] = await Promise.all([
      api.listConversations(),
      api.getRevealedMatches(),
    ]);
    setRows(convos as Row[]);
    setRevealed(reveals);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const pendingReveals = revealed.filter(
    (r) => r.match.status === 'ble_confirmed' || r.match.status === 'continued',
  );

  const newMatches = pendingReveals.map((r) => ({
    id: r.match.id,
    uri: r.peer.photo_urls[0],
    name: r.peer.display_name,
  }));

  const openReveal = (matchId: string) => {
    const hit = revealed.find((r) => r.match.id === matchId);
    if (hit) setActiveReveal(hit);
  };

  const onContinue = async () => {
    if (!activeReveal) return;
    setBusy(true);
    try {
      const res = await api.recordAction(activeReveal.match.id, 'continue');
      setActiveReveal(null);
      await load();
      if (res.conversation_id) router.push(`/chat/${res.conversation_id}`);
    } finally {
      setBusy(false);
    }
  };

  const onPass = async () => {
    if (!activeReveal) return;
    setBusy(true);
    try {
      await api.recordAction(activeReveal.match.id, 'pass');
      setActiveReveal(null);
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.wrap, { paddingBottom: layout.tabBarInset }]}
      >
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>People you've connected with nearby</Text>

        {newMatches.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel>New matches</SectionLabel>
            <View style={styles.card}>
              <MatchAvatarRow items={newMatches} onPress={openReveal} />
            </View>
          </View>
        ) : null}

        <SectionLabel>Messages</SectionLabel>
        <ListCard>
          {rows.length === 0 ? (
            <EmptyState
              emoji="💬"
              title="No messages yet"
              body="When you both like each other after a buzz, chat unlocks here."
            />
          ) : (
            rows.map((r, i) => (
              <View key={r.conversation.id}>
                <ListRow
                  avatarUri={r.peer.photo_urls[0]}
                  title={r.peer.display_name}
                  subtitle="Say something…"
                  onPress={() => router.push(`/chat/${r.conversation.id}`)}
                />
                {i < rows.length - 1 ? <ListDivider /> : null}
              </View>
            ))
          )}
        </ListCard>

        {pendingReveals.length > 0 && rows.length > 0 ? (
          <View style={styles.section}>
            <SectionLabel>Pending</SectionLabel>
            <ListCard>
              {pendingReveals.map((r, i) => (
                <View key={r.match.id}>
                  <ListRow
                    avatarUri={r.peer.photo_urls[0]}
                    title={r.peer.display_name}
                    subtitle={r.match.status === 'ble_confirmed' ? 'Tap to respond' : 'Waiting on them'}
                    badge={r.match.status === 'ble_confirmed' ? 'New' : undefined}
                    onPress={() => openReveal(r.match.id)}
                  />
                  {i < pendingReveals.length - 1 ? <ListDivider /> : null}
                </View>
              ))}
            </ListCard>
          </View>
        ) : null}
      </ScrollView>

      <MatchReveal reveal={activeReveal} onContinue={onContinue} onPass={onPass} busy={busy} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing.sm },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.8,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  section: { marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
