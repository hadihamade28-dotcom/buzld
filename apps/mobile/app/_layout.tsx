import {
  Fraunces_500Medium,
  Fraunces_700Bold,
  useFonts,
} from '@expo-google-fonts/fraunces';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConfigRequired } from '@/components/ConfigRequired';
import { MobileShell } from '@/components/MobileShell';
import { AuthProvider, useAuth } from '@/lib/auth';
import { colors } from '@/constants/theme';
import { stepRoute } from '@/lib/onboarding';
import { isSupabaseConfigured } from '@/lib/supabase';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => undefined);
}

function RootNavigator() {
  const { loading, userId, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === '(onboarding)';

    if (!userId && !inAuth) {
      router.replace('/(auth)');
      return;
    }

    if (userId && profile && !profile.onboarding_complete && !inOnboarding) {
      if (profile.onboarding_step && profile.onboarding_step !== 'done') {
        router.replace(stepRoute(profile.onboarding_step));
      } else {
        router.replace('/(onboarding)/welcome');
      }
      return;
    }

    if (userId && profile?.onboarding_complete && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [loading, userId, profile, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.rose} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ presentation: 'card', headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    Fraunces_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || Platform.OS === 'web') {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
          ...(Platform.OS === 'web' ? { minHeight: '100vh' as unknown as number } : {}),
        }}
      >
        <ActivityIndicator color={colors.rose} />
      </View>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <MobileShell>
            <ConfigRequired />
          </MobileShell>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MobileShell>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </MobileShell>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
