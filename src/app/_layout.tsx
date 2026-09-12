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
            headerShown: true,
            title: 'Add Transaction',
            presentation: 'modal',
          }}
        />
      </Stack>
    </AppDatabaseProvider>
  );
}