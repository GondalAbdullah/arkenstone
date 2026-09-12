import { Stack } from 'expo-router';
import { AppDatabaseProvider } from '../db/database';

export default function RootLayout() {
  return (
    <AppDatabaseProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
    </AppDatabaseProvider>
  );
}