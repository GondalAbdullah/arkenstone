import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Delete } from 'lucide-react-native';

// Amounts are whole Rupees (docs/adr/0002-currency-pkr-integer-amounts.md), so
// this keypad only ever needs digits — no decimal point.
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

// Caps entry at 999,999,999 Rs, comfortably past any real personal expense.
const MAX_DIGITS = 9;

interface NumericKeypadProps {
  /** Digits typed so far, e.g. '', '0', '1250'. */
  value: string;
  onChange: (next: string) => void;
  color?: string;
}

export function NumericKeypad({ value, onChange, color = '#4e635a' }: NumericKeypadProps) {
  const press = (key: string) => {
    if (key === 'back') {
      onChange(value.slice(0, -1));
      return;
    }
    // no leading zeros — typing '0' first just keeps a single '0'
    const next = value === '0' ? key : value + key;
    if (next.length > MAX_DIGITS) return;
    onChange(next);
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((key, i) =>
        key === '' ? (
          <View key={i} style={styles.key} />
        ) : (
          <TouchableOpacity
            key={i}
            style={styles.key}
            onPress={() => press(key)}
            onLongPress={key === 'back' ? () => onChange('') : undefined}
            activeOpacity={0.6}
          >
            {key === 'back' ? (
              <Delete color={color} size={24} />
            ) : (
              <Text style={[styles.keyText, { color }]}>{key}</Text>
            )}
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  key: { width: '33.33%', height: 60, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 26, fontWeight: '600' },
});
