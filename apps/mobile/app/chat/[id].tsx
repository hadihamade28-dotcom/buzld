import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppScreen } from '@/components/FlowShell';
import { Avatar, EmptyState } from '@/components/ui';
import { colors, fonts, gradients, radii, shadows, spacing } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useChatRealtime } from '@/lib/realtime';
import type { Message } from '@/lib/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [peerName, setPeerName] = useState('Match');
  const [peerPhoto, setPeerPhoto] = useState<string | undefined>();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [msgs, convos] = await Promise.all([api.getMessages(id), api.listConversations()]);
    setMessages(msgs as Message[]);
    const row = (convos as { conversation: { id: string }; peer: { display_name: string; photo_urls: string[] } }[]).find(
      (c) => c.conversation.id === id,
    );
    if (row) {
      setPeerName(row.peer.display_name);
      setPeerPhoto(row.peer.photo_urls[0]);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useChatRealtime(id, (msg) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  });

  const send = async () => {
    if (!text.trim() || !id) return;
    setBusy(true);
    try {
      await api.sendMessage(id, text.trim());
      setText('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen padded={false}>
      <LinearGradient colors={[...gradients.flameSoft]} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Avatar uri={peerPhoto} size={40} ring />
          <Text style={styles.headerTitle}>{peerName}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messages}
          ListEmptyComponent={
            <EmptyState emoji="👋" title="You matched nearby" body="Break the ice — say something!" />
          }
          renderItem={({ item }) => {
            const mine = item.sender_id === userId;
            return (
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                {mine ? (
                  <LinearGradient colors={[...gradients.flame]} style={styles.bubbleGradient}>
                    <Text style={styles.bubbleTextMine}>{item.body}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.bubbleText}>{item.body}</Text>
                )}
              </View>
            );
          }}
        />

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={send}
            disabled={busy || !text.trim()}
            style={[styles.sendWrap, (!text.trim() || busy) && styles.sendDisabled]}
          >
            <LinearGradient
              colors={(!text.trim() || busy) ? [colors.glassStrong, colors.glassStrong] : [...gradients.flame]}
              style={styles.send}
            >
              <Text style={styles.sendText}>↑</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...shadows.sm,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  back: { fontSize: 30, color: colors.rose, fontWeight: '300', marginTop: -3 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 17 },
  messages: { padding: spacing.md, gap: 10, flexGrow: 1 },
  bubble: { maxWidth: '78%' },
  mine: { alignSelf: 'flex-end' },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    ...shadows.sm,
  },
  bubbleGradient: {
    borderRadius: 22,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 11,
    ...shadows.sm,
  },
  bubbleText: { fontFamily: fonts.body, color: colors.text, fontSize: 15, lineHeight: 21 },
  bubbleTextMine: { fontFamily: fonts.body, color: colors.white, fontSize: 15, lineHeight: 21 },
  composer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'flex-end',
    ...shadows.float,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 100,
    borderRadius: radii.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
  },
  sendWrap: { ...shadows.glow },
  send: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.5 },
  sendText: { color: colors.white, fontSize: 20, fontWeight: '700' },
});
