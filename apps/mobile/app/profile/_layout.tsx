import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="edit" />
      <Stack.Screen name="discovery" />
      <Stack.Screen name="interests" />
      <Stack.Screen name="safety" />
    </Stack>
  );
}
