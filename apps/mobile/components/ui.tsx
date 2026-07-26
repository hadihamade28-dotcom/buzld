import { PhotoImage } from '@/components/PhotoImage';
import { VicinoLogo, VicinoLogoMark } from '@/components/VicinoLogo';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, gradients, radii, shadows, spacing, type as typeScale } from '@/constants/theme';

type Variant = 'primary' | 'ghost' | 'danger' | 'rose' | 'dark';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  small,
  large,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
  large?: boolean;
} & Pick<PressableProps, 'onPress'>) {
  const isDisabled = disabled || loading;
  const isFilled = variant === 'primary' || variant === 'rose';

  if (variant === 'dark') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.btnBase,
          small && styles.btnSmall,
          large && styles.btnLarge,
          styles.btnDark,
          pressed && styles.btnPressed,
          isDisabled && styles.btnDisabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.btnLabel, styles.btnLabelLight, small && styles.btnLabelSmall, large && styles.btnLabelLarge]}>
            {label}
          </Text>
        )}
      </Pressable>
    );
  }

  if (isFilled) {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [pressed && styles.btnPressed, isDisabled && styles.btnDisabled, style]}
      >
        <LinearGradient
          colors={[...gradients.flame]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.btnBase,
            small && styles.btnSmall,
            large && styles.btnLarge,
            isDisabled && styles.btnDisabled,
            shadows.glow,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.btnLabel, styles.btnLabelLight, small && styles.btnLabelSmall, large && styles.btnLabelLarge]}>
              {label}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btnBase,
        small && styles.btnSmall,
        large && styles.btnLarge,
        variant === 'ghost' && styles.btnGhost,
        variant === 'danger' && styles.btnDanger,
        pressed && styles.btnPressed,
        isDisabled && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={[styles.btnLabel, variant === 'ghost' && { color: colors.text }, small && styles.btnLabelSmall, large && styles.btnLabelLarge]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function Title({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function BrandMark({ large, minimal, light }: { large?: boolean; minimal?: boolean; light?: boolean }) {
  if (minimal) {
    return <VicinoLogoMark size={large ? 54 : 40} />;
  }
  return <VicinoLogo large={large} light={light} />;
}

export function Body({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

export function SectionLabel({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  return <Text style={[styles.sectionLabel, style]}>{children}</Text>;
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.screenHeader}>
      <Text style={styles.screenHeaderTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenHeaderSub}>{subtitle}</Text> : null}
    </View>
  );
}

export function AuthToggle({
  mode,
  onChange,
}: {
  mode: 'in' | 'up';
  onChange: (m: 'in' | 'up') => void;
}) {
  return (
    <View style={styles.authToggle}>
      <Pressable
        onPress={() => onChange('up')}
        style={[styles.authToggleBtn, mode === 'up' && styles.authToggleActive]}
      >
        <Text style={[styles.authToggleText, mode === 'up' && styles.authToggleTextActive]}>Sign up</Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('in')}
        style={[styles.authToggleBtn, mode === 'in' && styles.authToggleActive]}
      >
        <Text style={[styles.authToggleText, mode === 'in' && styles.authToggleTextActive]}>Log in</Text>
      </Pressable>
    </View>
  );
}

export function Input({ label, style, ...props }: TextInputProps & { label?: string; style?: TextStyle }) {
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...props} />
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress?: () => void }) {
  const inner = (
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  );

  if (!onPress) {
    if (active) {
      return (
        <LinearGradient colors={[...gradients.chipActive]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.chip, styles.chipActive]}>
          {inner}
        </LinearGradient>
      );
    }
    return <View style={styles.chip}>{inner}</View>;
  }

  if (active) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.88 }]}>
        <LinearGradient colors={[...gradients.chipActive]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.chip, styles.chipActive]}>
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}>
      {inner}
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ListCard({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.listCard, style]}>{children}</View>;
}

export function ListDivider() {
  return <View style={styles.listDivider} />;
}

export function Avatar({
  uri,
  size = 56,
  online,
  ring,
}: {
  uri?: string | null;
  size?: number;
  online?: boolean;
  ring?: boolean;
}) {
  const r = size / 2;
  return (
    <View
      style={[
        ring && {
          padding: 3,
          borderRadius: r + 3,
          borderWidth: 2.5,
          borderColor: colors.rose,
        },
      ]}
    >
      <View style={{ width: size, height: size }}>
        {uri ? (
          <PhotoImage path={uri} style={{ width: size, height: size, borderRadius: r }} contentFit="cover" />
        ) : (
          <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: r }]} />
        )}
        {online ? <View style={[styles.onlineDot, { right: ring ? -1 : 0, bottom: ring ? -1 : 0 }]} /> : null}
      </View>
    </View>
  );
}

export function MatchAvatarRow({
  items,
  onPress,
}: {
  items: { id: string; uri?: string; name: string }[];
  onPress?: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matchRow}>
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => onPress?.(item.id)} style={styles.matchItem}>
          <Avatar uri={item.uri} size={76} ring />
          <Text style={styles.matchName} numberOfLines={1}>
            {item.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function ListRow({
  avatarUri,
  title,
  subtitle,
  onPress,
  badge,
  time,
}: {
  avatarUri?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  badge?: string;
  time?: string;
}) {
  const content = (
    <>
      <Avatar uri={avatarUri} size={56} />
      <View style={styles.listRowText}>
        <View style={styles.listRowTop}>
          <Text style={styles.listRowTitle}>{title}</Text>
          {time ? <Text style={styles.listRowTime}>{time}</Text> : null}
        </View>
        {subtitle ? (
          <Text style={styles.listRowSub} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <LinearGradient colors={[...gradients.flame]} style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </LinearGradient>
      ) : onPress ? (
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.listRow, pressed && styles.listRowPressed]}>
        {content}
      </Pressable>
    );
  }
  return <View style={styles.listRow}>{content}</View>;
}

export function SwitchRow({
  label,
  subtitle,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.switchLabel}>{label}</Text>
        {subtitle ? <Text style={styles.switchSub}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.rose, false: colors.glassStrong }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.glassStrong}
      />
    </View>
  );
}

export function EmptyState({ emoji, title, body }: { emoji: string; title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <Text style={styles.emptyEmoji}>{emoji}</Text>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function OnboardingProgress({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressWrap}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.progressDot, i < step && styles.progressDotDone]} />
      ))}
    </View>
  );
}

export function PromptCard({ prompt, answer }: { prompt: string; answer: string }) {
  return (
    <View style={styles.promptCard}>
      <LinearGradient colors={[...gradients.flame]} style={styles.promptAccent} />
      <View style={styles.promptContent}>
        <Text style={styles.promptLabel}>{prompt}</Text>
        <Text style={styles.promptAnswer}>{answer}</Text>
      </View>
    </View>
  );
}

export function SettingsRow({
  label,
  subtitle,
  onPress,
  last,
}: {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingsRow, !last && styles.settingsRowBorder, pressed && { opacity: 0.7 }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.settingsLabel}>{label}</Text>
        {subtitle ? <Text style={styles.settingsSub}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function SubScreenHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.subHeader}>
      <Pressable onPress={onBack} style={styles.subBackBtn} hitSlop={8}>
        <Text style={styles.subBack}>‹</Text>
      </Pressable>
      <Text style={styles.subTitle}>{title}</Text>
      <View style={styles.subBackBtn} />
    </View>
  );
}

export function ChatHeader({
  title,
  avatarUri,
  onBack,
}: {
  title: string;
  avatarUri?: string | null;
  onBack: () => void;
}) {
  return (
    <View style={styles.chatHeader}>
      <Pressable onPress={onBack} style={styles.subBackBtn} hitSlop={8}>
        <Text style={styles.subBack}>‹</Text>
      </Pressable>
      <View style={styles.chatHeaderCenter}>
        <Avatar uri={avatarUri} size={38} ring />
        <Text style={styles.chatHeaderTitle}>{title}</Text>
      </View>
      <View style={styles.subBackBtn} />
    </View>
  );
}

export function StatusPill({
  label,
  live,
}: {
  label: string;
  live?: boolean;
}) {
  return (
    <View style={styles.statusPill}>
      <View style={[styles.statusDot, live && styles.statusDotLive]} />
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

export function PhotoPicker({
  uri,
  remotePath,
  onPress,
  height = 320,
  hint = 'Add photo',
}: {
  uri?: string | null;
  remotePath?: string | null;
  onPress: () => void;
  height?: number;
  hint?: string;
}) {
  const hasPhoto = uri || remotePath;
  return (
    <Pressable onPress={onPress} style={[styles.photoWrap, { height }]}>
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : remotePath ? (
        <PhotoImage path={remotePath} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <LinearGradient colors={[...gradients.flameSoft]} style={styles.photoEmpty}>
          <View style={styles.photoPlusCircle}>
            <Text style={styles.photoPlus}>+</Text>
          </View>
          <Text style={styles.photoHint}>{hint}</Text>
        </LinearGradient>
      )}
      {hasPhoto ? (
        <View style={styles.photoEditBadge}>
          <Text style={styles.photoEditText}>Edit</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btnBase: {
    minHeight: 54,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  btnSmall: { minHeight: 46, paddingHorizontal: spacing.md },
  btnLarge: { minHeight: 58, paddingHorizontal: spacing.xl },
  btnDark: { backgroundColor: colors.text, ...shadows.sm },
  btnGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    ...shadows.sm,
  },
  btnDanger: { backgroundColor: colors.danger },
  btnPressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  btnDisabled: { opacity: 0.45 },
  btnLabel: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  btnLabelLight: { color: colors.white },
  btnLabelSmall: { fontSize: 14 },
  btnLabelLarge: { fontSize: 18, letterSpacing: 0.2 },
  title: { ...typeScale.h1 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandFlame: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  brandFlameLarge: { width: 54, height: 54, borderRadius: 18 },
  brandFlameIcon: { color: colors.white, fontSize: 17 },
  brand: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
    fontSize: 28,
    letterSpacing: -0.8,
    textTransform: 'lowercase',
  },
  brandLarge: { fontSize: 40 },
  brandLight: { color: colors.white },
  body: { ...typeScale.body },
  eyebrow: { ...typeScale.label },
  sectionLabel: { ...typeScale.label, marginBottom: spacing.sm },
  screenHeader: { marginBottom: spacing.lg },
  screenHeaderTitle: { ...typeScale.h1, fontSize: 32, letterSpacing: -0.8 },
  screenHeaderSub: { ...typeScale.bodySm, marginTop: 6 },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: colors.glass,
    borderRadius: radii.full,
    padding: 4,
    marginBottom: spacing.lg,
  },
  authToggleBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: radii.full,
  },
  authToggleActive: { backgroundColor: colors.surface, ...shadows.sm },
  authToggleText: { fontFamily: fonts.bodyMedium, color: colors.textMuted, fontSize: 15 },
  authToggleTextActive: { fontFamily: fonts.bodyBold, color: colors.text },
  inputWrap: { marginBottom: spacing.sm },
  inputLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 15,
    ...shadows.sm,
  },
  chip: {
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipActive: { borderColor: 'transparent', borderWidth: 0 },
  chipText: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 14, textTransform: 'capitalize' },
  chipTextActive: { color: colors.white, fontFamily: fonts.bodyBold },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  listDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 80,
  },
  avatarPlaceholder: { backgroundColor: colors.glassStrong },
  onlineDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2.5,
    borderColor: colors.surface,
  },
  matchRow: { gap: spacing.md, paddingVertical: spacing.sm },
  matchItem: { alignItems: 'center', width: 84 },
  matchName: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  listRowPressed: { backgroundColor: colors.surfaceMuted },
  listRowText: { flex: 1 },
  listRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listRowTitle: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  listRowTime: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 12 },
  listRowSub: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 14, marginTop: 3 },
  chevron: { fontSize: 24, color: colors.textMuted, fontWeight: '300' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 10, textTransform: 'uppercase' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  switchLabel: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  switchSub: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.roseSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 18, textAlign: 'center' },
  emptyBody: {
    fontFamily: fonts.body,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
    maxWidth: 280,
  },
  progressWrap: { flexDirection: 'row', gap: 6, marginBottom: spacing.lg },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.glassStrong },
  progressDotDone: { backgroundColor: colors.rose },
  promptCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  promptAccent: { width: 4 },
  promptContent: { flex: 1, padding: spacing.md },
  promptLabel: { fontFamily: fonts.bodyBold, color: colors.rose, fontSize: 13, marginBottom: 8 },
  promptAnswer: { fontFamily: fonts.displayMedium, color: colors.text, fontSize: 18, lineHeight: 26 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsLabel: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 16 },
  settingsSub: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  subBackBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  subBack: { fontSize: 30, color: colors.rose, fontWeight: '300', marginTop: -3 },
  subTitle: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 17 },
  chatHeader: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  chatHeaderCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatHeaderTitle: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 17 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted },
  statusDotLive: { backgroundColor: colors.rose },
  statusText: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 14 },
  photoWrap: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoPlusCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  photoPlus: { fontSize: 32, color: colors.rose, fontWeight: '300' },
  photoHint: { fontFamily: fonts.bodyMedium, color: colors.textSecondary, marginTop: spacing.sm, fontSize: 15 },
  photoEditBadge: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.overlay,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  photoEditText: { fontFamily: fonts.bodyBold, color: colors.white, fontSize: 13 },
});
