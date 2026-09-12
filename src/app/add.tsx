import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Plus } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getCategoriesFor } from '@/constants/categories';
import type { TransactionType } from '@/db/types';
import { CURRENCY_SYMBOL, parseAmountDigits } from '@/utils/currency';
import { toSqliteLocalDateTime } from '@/utils/datetime';
import { NumericKeypad } from '@/components/numeric-keypad';

// Colors derived from the provided Tailwind config
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
  incomeContainer: '#a9c9b3',
};

function formatDate(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

export default function AddTransactionScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [type, setType] = useState<TransactionType>('expense');
  const [amountDigits, setAmountDigits] = useState('');
  const [name, setName] = useState('');
  const categories = getCategoriesFor(type);
  const [category, setCategory] = useState(categories[0].key);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Switching Expense/Income swaps the whole category list, so the
  // previously-selected category (e.g. "Food") no longer applies.
  useEffect(() => {
    setCategory(getCategoriesFor(type)[0].key);
  }, [type]);

  const accent = type === 'income' ? COLORS.income : COLORS.primary;
  const accentContainer = type === 'income' ? COLORS.incomeContainer : COLORS.primaryContainer;

  const handleSave = async () => {
    const numericAmount = parseAmountDigits(amountDigits);
    if (!numericAmount) {
      Alert.alert('Incomplete', `Please enter a valid amount in ${CURRENCY_SYMBOL} to record.`);
      return;
    }

    try {
      await db.runAsync(
        'INSERT INTO transactions (type, amount, category, name, timestamp) VALUES (?, ?, ?, ?, ?)',
        [type, numericAmount, category, name, toSqliteLocalDateTime(date)]
      );
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not record entry into the ledger.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ArrowLeft color={COLORS.onSurface} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{type === 'income' ? 'Add Income' : 'Add Expense'}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Expense / Income toggle */}
        <View style={styles.typeToggle}>
          {(['expense', 'income'] as const).map((t) => {
            const isActive = type === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.typeOption, isActive && { backgroundColor: t === 'income' ? COLORS.income : COLORS.primary }]}
                onPress={() => setType(t)}
              >
                <Text style={[styles.typeOptionText, isActive && styles.typeOptionTextActive]}>
                  {t === 'income' ? 'Income' : 'Expense'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Amount Display Area */}
        <View style={styles.amountSection}>
          <Text style={styles.labelCaps}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
            <Text style={[styles.amountText, !amountDigits && styles.amountTextPlaceholder]}>
              {amountDigits || '0'}
            </Text>
          </View>
          <View style={[styles.amountUnderline, { backgroundColor: accentContainer }]} />
        </View>

        <NumericKeypad value={amountDigits} onChange={setAmountDigits} color={COLORS.onSurface} />

        {/* Bottom Sheet UI */}
        <View style={styles.sheetContainer}>

          {/* Transaction Name */}
          <Text style={styles.sectionLabel}>Transaction Name</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder={type === 'income' ? 'e.g. September Salary' : 'e.g. Morning Coffee'}
            placeholderTextColor={COLORS.onSurfaceVariant}
          />

          {/* Categories Grid */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map(({ key, icon: Icon }) => {
              const isActive = category === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.categoryWrapper}
                  onPress={() => setCategory(key)}
                >
                  <View style={[styles.categoryIconBox, isActive && { backgroundColor: `${accent}33` }]}>
                    <Icon color={isActive ? accent : COLORS.onSurfaceVariant} size={22} />
                  </View>
                  <Text
                    style={[styles.categoryText, isActive && { color: accent }]}
                    numberOfLines={1}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date */}
          <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Date</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Calendar color={COLORS.onSurfaceVariant} size={20} />
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onValueChange={(_, selected) => {
                setShowPicker(Platform.OS === 'ios');
                setDate(selected);
              }}
              onDismiss={() => setShowPicker(false)}
            />
          )}

          {/* Save Button */}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentContainer }]} onPress={handleSave}>
            <Plus color={COLORS.onPrimary} size={18} />
            <Text style={styles.saveBtnText}>{type === 'income' ? 'Add Income' : 'Add Expense'}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 20,
    marginTop: 40 // Safe area inset adjustment
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.onSurface,
    marginLeft: 8
  },
  scrollContent: {
    flexGrow: 1,
  },
  typeToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  typeOptionTextActive: {
    color: COLORS.onPrimary,
  },
  amountSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  labelCaps: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    opacity: 0.5,
    marginRight: 8,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '600',
    color: COLORS.onSurface,
    minWidth: 60,
  },
  amountTextPlaceholder: {
    opacity: 0.4,
  },
  amountUnderline: {
    height: 4,
    width: 96,
    borderRadius: 99,
    marginTop: 16,
    opacity: 0.5,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#2D2D2D',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.onSurface,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  categoryWrapper: {
    width: '22%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  saveBtn: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: COLORS.onPrimary,
    fontSize: 18,
    fontWeight: '600',
  }
});
