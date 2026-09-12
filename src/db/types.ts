export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: number;
  type: TransactionType;
  // Whole Pakistani Rupees. No subunit — see docs/adr/0002-currency-pkr-integer-amounts.md
  amount: number;
  category: string;
  name: string | null;
  // 'YYYY-MM-DD HH:MM:SS' in local time (matches SQLite's datetime('now','localtime'))
  timestamp: string;
}
