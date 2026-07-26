import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, layout, shadows, spacing } from '@/constants/theme';

function TabIcon({
  name,
  focused,
  label,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
}) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons name={name} size={focused ? 24 : 22} color={focused ? colors.rose : colors.textMuted} />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'flame' : 'flame-outline'} focused={focused} label="Discover" />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'heart' : 'heart-outline'} focused={focused} label="Matches" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? 'person-circle' : 'person-circle-outline'} focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    height: layout.tabBarHeight,
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    borderRadius: 36,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    ...shadows.float,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', gap: 2, flex: 1 },
  iconWrap: {
    width: 40,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapActive: { backgroundColor: colors.roseSoft },
  tabLabel: { fontFamily: fonts.bodyMedium, fontSize: 10, color: colors.textMuted },
  tabLabelActive: { fontFamily: fonts.bodyBold, color: colors.rose },
});
