// The app tracks a single currency: Pakistani Rupees, as whole integers
// (no paisa/cents — see docs/adr/0002-currency-pkr-integer-amounts.md).
export const CURRENCY_SYMBOL = 'Rs.';

/** "Rs. 1,234" — for totals/balances, where the sign (if any) is meaningful on its own. */
export function formatAmount(value: number): string {
  return `${CURRENCY_SYMBOL} ${Math.round(value).toLocaleString('en-US')}`;
}

/** "+Rs. 1,200" / "-Rs. 450" — for individual transaction rows. */
export function formatSignedAmount(value: number, type: 'income' | 'expense'): string {
  const magnitude = Math.round(Math.abs(value)).toLocaleString('en-US');
  return `${type === 'income' ? '+' : '-'}${CURRENCY_SYMBOL} ${magnitude}`;
}

/** Parses keypad digits ('' | '0' | '1250' | ...) into a whole-rupee integer amount. */
export function parseAmountDigits(digits: string): number {
  if (!digits) return 0;
  const n = parseInt(digits, 10);
  return Number.isNaN(n) ? 0 : n;
}
