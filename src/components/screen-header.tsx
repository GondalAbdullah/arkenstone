import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { User } from 'lucide-react-native';

// Every tab screen used to copy-paste this row, and on History/Categories/
// Settings the copied title still literally read "Balance" — a label that
// only made sense on the dashboard. One shared header fixes that and the
// duplication together.
export function ScreenHeader({ title, color = '#4e635a' }: { title: string; color?: string }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color }]}>{title}</Text>
      <TouchableOpacity style={[styles.avatarBtn, { backgroundColor: color }]} onPress={() => router.push('/settings')}>
        <User color="#FFFFFF" size={18} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontSize: 26, fontWeight: '600' },
  avatarBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
});
