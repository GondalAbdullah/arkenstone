import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ScreenHeader } from '@/components/screen-header';
import { getCategoryMeta as getMeta } from '@/constants/categories';
import { formatAmount } from '@/utils/currency';

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

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
};

// Ring / accent palette, cycled in spend-descending order
const PALETTE = ['#4e635a', '#f0a98d', '#8da399', '#8b4a3d', '#c9a86a', '#6c7b8b'];

const RING_SIZE = 220;
const STROKE = 28;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CategoryBreakdownScreen() {
  const db = useSQLiteContext();
  const [selectedMonth, setSelectedMonth] = useState(() => startOfMonth(new Date()));
  const [categories, setCategories] = useState<{ category: string; total: number }[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);

  const isCurrentMonth = monthKey(selectedMonth) === monthKey(new Date());

  const loadCategoryData = useCallback(
    async (month: Date) => {
      try {
        const result = await db.getAllAsync(
          `SELECT
            category,
            SUM(amount) as total
          FROM transactions
          WHERE type = 'expense'
            AND strftime('%Y-%m', timestamp) = ?
          GROUP BY category
          ORDER BY total DESC;`,
          [monthKey(month)]
        );

        setCategories(result as { category: string; total: number }[]);
        const sum = (result as { total: number }[]).reduce((acc, curr) => acc + (curr.total || 0), 0);
        setTotalExpense(sum);
      } catch (error) {
        console.error('Failed to load category breakdown:', error);
      }
    },
    [db]
  );

  useFocusEffect(
    useCallback(() => {
      loadCategoryData(selectedMonth);
    }, [selectedMonth, loadCategoryData])
  );

  const shiftMonth = (delta: number) => {
    setSelectedMonth((prev) => {
      const next = startOfMonth(new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
      // Never navigate past the current month — there's nothing to show yet.
      return next > startOfMonth(new Date()) ? prev : next;
    });
  };

  let cumulative = 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Arkenstone" />

      <FlatList
        data={categories}
        keyExtractor={(item) => item.category}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        ListHeaderComponent={
          <View>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>

            {/* Month navigation — this screen used to be locked to the
                current month with no way back, which made it useless once
                the month changed: your spending history was still in
                History, but there was nowhere to *analyze* a past month. */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.monthNavBtn} hitSlop={8}>
                <ChevronLeft color={COLORS.onSurfaceVariant} size={20} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedMonth(startOfMonth(new Date()))}>
                <Text style={styles.monthNavLabel}>{monthLabel(selectedMonth)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => shiftMonth(1)}
                disabled={isCurrentMonth}
                style={styles.monthNavBtn}
                hitSlop={8}
              >
                <ChevronRight color={isCurrentMonth ? COLORS.surfaceVariant : COLORS.onSurfaceVariant} size={20} />
              </TouchableOpacity>
            </View>

            {/* Donut chart */}
            <View style={styles.ringWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                {categories.map((item, i) => {
                  const value = item.total || 0;
                  const fraction = totalExpense > 0 ? value / totalExpense : 0;
                  const segmentLength = fraction * CIRCUMFERENCE;
                  const offset = cumulative;
                  cumulative += segmentLength;
                  return (
                    <Circle
                      key={item.category}
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RADIUS}
                      stroke={PALETTE[i % PALETTE.length]}
                      strokeWidth={STROKE}
                      strokeDasharray={`${segmentLength} ${CIRCUMFERENCE - segmentLength}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="butt"
                      fill="none"
                      rotation={-90}
                      origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                    />
                  );
                })}
              </Svg>
              <View style={styles.ringCenter} pointerEvents="none">
                <Text style={styles.ringLabel}>{isCurrentMonth ? 'Spent so far' : 'Spent'}</Text>
                <Text style={styles.ringAmount}>{formatAmount(totalExpense)}</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const meta = getMeta(item.category);
          const Icon = meta.icon;
          const spent = item.total || 0;
          // Share of this month's total expenses — not a budget (the app
          // doesn't have one), just how this category stacks up against
          // everything else spent this month.
          const sharePct = totalExpense > 0 ? Math.min(100, (spent / totalExpense) * 100) : 0;
          const ringColorIndex = categories.findIndex((c) => c.category === item.category);
          const barColor = PALETTE[ringColorIndex % PALETTE.length];

          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.iconBadge, { backgroundColor: meta.tint }]}>
                  <Icon color={COLORS.onSurfaceVariant} size={20} />
                </View>

                <View style={styles.rowMid}>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryBlurb}>{meta.blurb}</Text>
                </View>

                <View style={styles.rowRight}>
                  <Text style={styles.categoryTotal}>{formatAmount(spent)}</Text>
                  <Text style={styles.categoryShare}>{Math.round(sharePct)}% of total</Text>
                </View>
              </View>

              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${sharePct}%`, backgroundColor: barColor }]} />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isCurrentMonth
              ? 'No spending recorded yet this month.'
              : `No spending recorded in ${monthLabel(selectedMonth)}.`}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: 20, paddingTop: 60 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: '600', color: COLORS.primary },
  avatarBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },

  ringWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 28 },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  ringLabel: { fontSize: 15, color: COLORS.onSurfaceVariant, marginBottom: 4 },
  ringAmount: { fontSize: 40, fontWeight: '700', color: COLORS.onSurface },

  sectionTitle: { fontSize: 24, fontWeight: '700', color: COLORS.onSurface, textAlign: 'center', marginBottom: 16 },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavLabel: { fontSize: 15, fontWeight: '600', color: COLORS.onSurface, minWidth: 140, textAlign: 'center' },

  card: { backgroundColor: COLORS.surfaceContainerLowest, padding: 18, borderRadius: 18, marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconBadge: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowMid: { flex: 1 },
  categoryName: { fontSize: 18, fontWeight: '600', color: COLORS.onSurface },
  categoryBlurb: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  categoryTotal: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  categoryShare: { fontSize: 13, color: COLORS.onSurfaceVariant, marginTop: 2 },

  progressBarBackground: { height: 8, backgroundColor: COLORS.surfaceVariant, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },

  emptyText: { textAlign: 'center', color: COLORS.onSurfaceVariant, marginTop: 40, fontSize: 14 },
});