import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import { ScreenHeader } from '@/components/screen-header';
import { getCategoryMeta } from '@/constants/categories';
import { formatAmount, formatSignedAmount } from '@/utils/currency';
import type { Transaction } from '@/db/types';

// ---- palette pulled from the mockup ----
const COLORS = {
  bg: '#F7F4EF',
  card: '#FFFFFF',
  sage: '#3F5148',
  sageDark: '#2E3D35',
  ink: '#1E2420',
  subtext: '#8A8F86',
  divider: '#E7E3DA',
  income: '#3B7A57',
  expense: '#1E2420',
  pill: '#EFEDE7',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [totals, setTotals] = useState({ income: 0, expense: 0 });
  const [prevExpense, setPrevExpense] = useState(0);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [week, setWeek] = useState<{ label: string; total: number; isToday: boolean }[]>([]);

  const loadData = async () => {
    try {
      // this month's income/expense totals
      const totalsResult = await db.getAllAsync(`
        SELECT type, SUM(amount) as total 
        FROM transactions 
        WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now', 'localtime')
        GROUP BY type;
      `);

      let income = 0;
      let expense = 0;
      totalsResult.forEach((row: any) => {
        // BUGFIX: SUM() can come back null for a type with no rows, which
        // silently turned the balance into NaN further down.
        if (row.type === 'income') income = row.total || 0;
        if (row.type === 'expense') expense = row.total || 0;
      });
      setTotals({ income, expense });

      // last month's expense, to power the "vs last month" badge
      const prevResult = await db.getAllAsync(`
        SELECT SUM(amount) as total
        FROM transactions
        WHERE type = 'expense'
          AND strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now', 'localtime', '-1 month');
      `);
      setPrevExpense((prevResult[0] as any)?.total || 0);

      // last 7 days of spend, for the mini bar chart
      const weekResult = await db.getAllAsync(`
        SELECT date(timestamp, 'localtime') as day, SUM(amount) as total
        FROM transactions
        WHERE type = 'expense' AND date(timestamp, 'localtime') >= date('now', 'localtime', '-6 days')
        GROUP BY day;
      `);
      const byDay: Record<string, number> = {};
      (weekResult as any[]).forEach((r) => { byDay[r.day] = r.total || 0; });

      const todayKey = new Date().toISOString().slice(0, 10);
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        days.push({
          label: DAY_LABELS[d.getDay()],
          total: byDay[key] || 0,
          isToday: key === todayKey,
        });
      }
      setWeek(days);

      const recentResult = await db.getAllAsync(`
        SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 5;
      `);
      setRecent(recentResult as Transaction[]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete transaction',
      'This entry will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Could not remove entry.');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const balance = totals.income - totals.expense;

  // percent change vs last month — down is good (spent less), matches the mockup's badge
  const pctChange = prevExpense > 0
    ? Math.round(((totals.expense - prevExpense) / prevExpense) * 100)
    : 0;
  const spendingDown = pctChange <= 0;
  const maxDay = Math.max(1, ...week.map((d) => d.total));

  return (
    <View style={styles.container}>
      <ScreenHeader title="Balance" color={COLORS.sage} />

      <FlatList
        data={recent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Balance card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Current balance</Text>
              <Text style={styles.balanceAmount}>{formatAmount(balance)}</Text>
              <View style={styles.balanceDivider} />
              <View style={styles.breakdownRow}>
                <View>
                  <Text style={styles.breakdownLabel}>Income</Text>
                  <Text style={styles.breakdownIncome}>{formatSignedAmount(totals.income, 'income')}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.breakdownLabel}>Expenses</Text>
                  <Text style={styles.breakdownExpense}>{formatSignedAmount(totals.expense, 'expense')}</Text>
                </View>
              </View>
            </View>

            {/* Weekly spend card */}
            <View style={styles.spendCard}>
              <View style={styles.spendHeaderRow}>
                <View>
                  <Text style={styles.spendLabel}>Total spent (this month)</Text>
                  <Text style={styles.spendAmount}>{formatAmount(totals.expense)}</Text>
                </View>
                {prevExpense > 0 && (
                  <View style={styles.pctBadge}>
                    {spendingDown ? (
                      <ArrowDownRight color={COLORS.ink} size={14} />
                    ) : (
                      <ArrowUpRight color={COLORS.ink} size={14} />
                    )}
                    <Text style={styles.pctText}>{Math.abs(pctChange)}%</Text>
                  </View>
                )}
              </View>

              <View style={styles.chartRow}>
                {week.map((d, i) => (
                  <View key={i} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max(4, (d.total / maxDay) * 70),
                            backgroundColor: d.isToday ? COLORS.sage : COLORS.divider,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.dayLabel, d.isToday && styles.dayLabelActive]}>
                      {d.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push('/history')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const { icon: Icon, tint, color } = getCategoryMeta(item.category);
          return (
            <TouchableOpacity
              style={styles.transactionItem}
              onLongPress={() => handleDelete(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.transactionLeft}>
                <View style={[styles.iconBadge, { backgroundColor: tint }]}>
                  <Icon color={color} size={18} />
                </View>
                <View>
                  <Text style={styles.transactionCategory}>{item.category}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.transactionAmount,
                  { color: item.type === 'income' ? COLORS.income : COLORS.ink },
                ]}
              >
                {formatSignedAmount(item.amount, item.type)}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet — add your first one below.</Text>}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add')}>
        <Plus color="#FFFFFF" size={28} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingTop: 60 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  headerTitle: { fontSize: 26, fontWeight: '600', color: COLORS.sageDark },
  avatarBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.sage, justifyContent: 'center', alignItems: 'center' },

  balanceCard: { backgroundColor: COLORS.sage, padding: 24, borderRadius: 22, marginBottom: 16 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: 0.5, marginBottom: 8 },
  balanceAmount: { color: '#FFFFFF', fontSize: 38, fontWeight: '700', marginBottom: 18 },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 },
  breakdownIncome: { color: '#DCEFE1', fontSize: 17, fontWeight: '600' },
  breakdownExpense: { color: '#FFFFFF', fontSize: 17, fontWeight: '600' },

  spendCard: { backgroundColor: COLORS.card, borderRadius: 22, padding: 22, marginBottom: 24 },
  spendHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  spendLabel: { color: COLORS.subtext, fontSize: 12, letterSpacing: 0.5, marginBottom: 6 },
  spendAmount: { color: COLORS.ink, fontSize: 26, fontWeight: '700' },
  pctBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: COLORS.pill, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  pctText: { color: COLORS.ink, fontSize: 13, fontWeight: '600' },

  chartRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { height: 70, justifyContent: 'flex-end', marginBottom: 8 },
  bar: { width: 8, borderRadius: 4 },
  dayLabel: { fontSize: 11, color: COLORS.subtext },
  dayLabelActive: { color: COLORS.sageDark, fontWeight: '700' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: COLORS.sageDark },
  seeAll: { fontSize: 13, color: COLORS.subtext },

  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.card, padding: 14, borderRadius: 16, marginBottom: 10 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBadge: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  transactionCategory: { fontSize: 15, fontWeight: '600', color: COLORS.ink },
  transactionDate: { fontSize: 12, color: COLORS.subtext, marginTop: 2 },
  transactionAmount: { fontSize: 16, fontWeight: '700' },

  emptyText: { textAlign: 'center', color: COLORS.subtext, marginTop: 30, fontSize: 14 },

  fab: { position: 'absolute', bottom: 30, right: 20, width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.sage, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
});