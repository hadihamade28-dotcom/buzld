import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/ui';
import { colors, fonts, radii, spacing } from '@/constants/theme';

export function ConfigRequired() {
  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.wrap}>
        <BrandMark large />
        <Text style={styles.title}>Backend required</Text>
        <Text style={styles.body}>
          Vicino runs on Supabase. Create a project, apply migrations, deploy edge functions, then
          add your keys to the app.
        </Text>

        <View style={styles.card}>
          <Text style={styles.step}>1. Create a Supabase project</Text>
          <Text style={styles.stepDetail}>supabase.com → New project</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.step}>2. Apply database migrations</Text>
          <Text style={styles.code}>supabase db push</Text>
          <Text style={styles.stepDetail}>Or run SQL from supabase/migrations/ in the SQL editor</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.step}>3. Deploy edge functions</Text>
          <Text style={styles.code}>supabase functions deploy find-candidates</Text>
          <Text style={styles.code}>supabase functions deploy confirm-proximity</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.step}>4. Configure the app</Text>
          <Text style={styles.code}>cp apps/mobile/.env.example apps/mobile/.env</Text>
          <Text style={styles.stepDetail}>
            Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart Expo.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: spacing.lg, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.text,
    marginTop: spacing.xl,
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  step: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 15 },
  stepDetail: {
    fontFamily: fonts.body,
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  code: {
    fontFamily: fonts.bodyMedium,
    color: colors.rose,
    fontSize: 12,
    marginTop: 6,
    backgroundColor: colors.roseSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
