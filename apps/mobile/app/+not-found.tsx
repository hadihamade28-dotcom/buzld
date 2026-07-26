import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { Button, Title } from '@/components/ui';
import { spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.emoji}>🗺️</Text>
        <Title>Page not found</Title>
        <Link href="/" asChild>
          <Button label="Go home" style={{ marginTop: spacing.xl }} />
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 48, marginBottom: spacing.lg },
});
