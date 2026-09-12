import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { ScreenHeader } from '@/components/screen-header';
import { getCategoryMeta } from '@/constants/categories';
import { formatSignedAmount } from '@/utils/currency';
import type { Transaction } from '@/db/types';

// Colors derived from the same Tailwind config as the rest of the app
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

// Only ALL/INCOME/EXPENSES — a 'SUBSCRIPTIONS' pill used to sit here too, but
// no category is ever named "Subscriptions" (see src/constants/categories.ts),
// so it never matched a single transaction.
const FILTERS = [
  { key: 'all', label: 'ALL' },
  { key: 'income', label: 'INCOME' },
  { key: 'expense', label: 'EXPENSES' },
];

function groupLabel(date: Date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const loadHistory = async () => {
    try {
      const result = await db.getAllAsync(`
        SELECT id, type, amount, category, name, timestamp
        FROM transactions
        ORDER BY timestamp DESC;
      `);
      setTransactions(result as Transaction[]);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const sections = useMemo(() => {
    const filtered = transactions.filter((t) => {
      if (activeFilter === 'income' && t.type !== 'income') return false;
      if (activeFilter === 'expense' && t.type !== 'expense') return false;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = `${t.name || ''} ${t.category || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    const groups: Record<string, Transaction[]> = {};
    const order: string[] = [];
    filtered.forEach((t) => {
      const label = groupLabel(new Date(t.timestamp));
      if (!groups[label]) {
        groups[label] = [];
        order.push(label);
      }
      groups[label].push(t);
    });

    return order.map((title) => ({ title, data: groups[title] }));
  }, [transactions, search, activeFilter]);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Expense Tracker" />

      <Text style={styles.pageTitle}>Transaction History</Text>

      {/* Search */}
      <View style={styles.searchBar}>
        <Search color={COLORS.onSurfaceVariant} size={18} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search transactions..."
          placeholderTextColor={COLORS.onSurfaceVariant}
        />
        <SlidersHorizontal color={COLORS.onSurfaceVariant} size={18} />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: 10 }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterPill, isActive && styles.activeFilterPill]}
              onPress={() => setActiveFilter(f.key)}
            >
              <Text style={[styles.filterText, isActive && styles.activeFilterText]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={(item: any) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item, index, section }: any) => {
          const meta = getCategoryMeta(item.category);
          const Icon = meta.icon;
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          const time = new Date(item.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <View
              style={[
                styles.row,
                isFirst && styles.rowFirst,
                isLast && styles.rowLast,
                !isLast && styles.rowDivider,
              ]}
            >
              <View style={[styles.iconBadge, { backgroundColor: meta.tint }]}>
                <Icon color={COLORS.onSurfaceVariant} size={20} />
              </View>

              <View style={styles.rowMid}>
                <Text style={styles.itemName}>{item.name || item.category}</Text>
                <Text style={styles.itemSubtitle}>{item.category} • {time}</Text>
              </View>

              <Text style={[styles.itemAmount, { color: item.type === 'income' ? COLORS.income : COLORS.onSurface }]}>
                {formatSignedAmount(item.amount, item.type)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: 20, paddingTop: 60 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  headerTitle: { fontSize: 26, fontWeight: '600', color: COLORS.primary },
  avatarBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },

  pageTitle: { fontSize: 26, fontWeight: '700', color: COLORS.onSurface, marginBottom: 16 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.onSurface },

  filterRow: { marginBottom: 20, flexGrow: 0 },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  activeFilterPill: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: COLORS.onSurfaceVariant },
  activeFilterText: { color: COLORS.onPrimary },

  sectionHeader: { fontSize: 15, fontWeight: '600', color: COLORS.onSurfaceVariant, marginBottom: 10, marginTop: 6 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowFirst: { borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  rowLast: { borderBottomLeftRadius: 18, borderBottomRightRadius: 18, marginBottom: 20 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: COLORS.surfaceVariant },

  iconBadge: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowMid: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.onSurface },
  itemSubtitle: { fontSize: 12, color: COLORS.onSurfaceVariant, marginTop: 2 },
  itemAmount: { fontSize: 16, fontWeight: '700' },

  emptyText: { textAlign: 'center', color: COLORS.onSurfaceVariant, marginTop: 40, fontSize: 14 },
});