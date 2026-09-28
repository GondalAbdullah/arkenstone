import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Pencil, Trash2 } from 'lucide-react-native';
import { getCategoryMeta } from '@/constants/categories';
import { formatSignedAmount } from '@/utils/currency';
import type { Transaction } from '@/db/types';

const COLORS = {
  surface: '#fcf9f8',
  onSurface: '#1b1c1c',
  onSurfaceVariant: '#424845',
  primaryContainer: '#8da399',
  onPrimary: '#ffffff',
  primary: '#4e635a',
  surfaceContainerLowest: '#ffffff',
  surfaceVariant: '#e4e2e1',
  income: '#3b7a57',
};

function formatFullDate(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

// Read-only view of a single transaction — opened by tapping a row on the
// dashboard or in History. Shows the full note ("detailed message") that's
// otherwise clipped or hidden in those list rows, plus Edit/Delete actions.
export default function TransactionDetailScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const transactionId = Number(id);

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const row = await db.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id = ?', [transactionId]);
        setTransaction(row);
      } catch (error) {
        console.error('Failed to load transaction:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [transactionId]);

  const handleDelete = () => {
    Alert.alert('Delete transaction', 'This entry will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await db.runAsync('DELETE FROM transactions WHERE id = ?', [transactionId]);
            router.back();
          } catch (error) {
            Alert.alert('Error', 'Could not remove entry.');
            console.error(error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.notFoundText}>This transaction no longer exists.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const meta = getCategoryMeta(transaction.category);
  const Icon = meta.icon;
  const accent = transaction.type === 'income' ? COLORS.income : COLORS.primary;
  const date = new Date(transaction.timestamp);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft color={COLORS.onSurface} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{transaction.type === 'income' ? 'Income' : 'Expense'} Details</Text>
        <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, styles.deleteButton]}>
          <Trash2 color={COLORS.onSurfaceVariant} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.amountSection}>
          <View style={[styles.iconBadge, { backgroundColor: meta.tint }]}>
            <Icon color={meta.color} size={28} />
          </View>
          <Text style={styles.category}>{transaction.category}</Text>
          <Text style={[styles.amount, { color: accent }]}>
            {formatSignedAmount(transaction.amount, transaction.type)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Note</Text>
          <Text style={transaction.name ? styles.noteText : styles.noteTextEmpty}>
            {transaction.name || 'No note added for this transaction.'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.dateRow}>
            <Calendar color={COLORS.onSurfaceVariant} size={20} />
            <View style={styles.dateTextWrap}>
              <Text style={styles.dateText}>{formatFullDate(date)}</Text>
              <Text style={styles.timeText}>{formatTime(date)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: accent }]}
          onPress={() => router.push({ pathname: '/add', params: { id: String(transaction.id) } })}
        >
          <Pencil color={COLORS.onPrimary} size={18} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  centered: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  notFoundText: { fontSize: 15, color: COLORS.onSurfaceVariant, textAlign: 'center', marginBottom: 16 },
  backLink: { paddingVertical: 8, paddingHorizontal: 16 },
  backLinkText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  iconButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  deleteButton: { marginLeft: 'auto', alignItems: 'flex-end' },
  headerTitle: { fontSize: 20, fontWeight: '500', color: COLORS.onSurface, marginLeft: 8 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  amountSection: { alignItems: 'center', paddingVertical: 24 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: { fontSize: 14, fontWeight: '600', color: COLORS.onSurfaceVariant, marginBottom: 6 },
  amount: { fontSize: 36, fontWeight: '700' },

  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  noteText: { fontSize: 16, color: COLORS.onSurface, lineHeight: 22 },
  noteTextEmpty: { fontSize: 16, color: COLORS.onSurfaceVariant, fontStyle: 'italic', lineHeight: 22 },

  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateTextWrap: { flex: 1 },
  dateText: { fontSize: 16, fontWeight: '500', color: COLORS.onSurface },
  timeText: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 2 },

  editBtn: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  editBtnText: { color: COLORS.onPrimary, fontSize: 16, fontWeight: '600' },
});
