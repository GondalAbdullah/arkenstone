import { View, Text, StyleSheet } from 'react-native';
import { ScreenHeader } from '@/components/screen-header';

const COLORS = { surface: '#fcf9f8', onSurface: '#1b1c1c', onSurfaceVariant: '#424845' };

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Arkenstone" />
      <Text style={styles.pageTitle}>Settings</Text>
      <Text style={styles.placeholder}>Nothing configurable yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: 20, paddingTop: 60 },
  pageTitle: { fontSize: 26, fontWeight: '700', color: COLORS.onSurface, marginBottom: 8 },
  placeholder: { fontSize: 14, color: COLORS.onSurfaceVariant },
});
