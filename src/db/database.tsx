import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { ReactNode } from 'react';

// Runs once when the app starts — creates the transactions table if needed.
async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      category TEXT NOT NULL,
      name TEXT,
      timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
  `);
}

// Bumped from money_tracker_v2.db: `amount` moved from REAL (dollars-and-cents)
// to INTEGER (whole Rupees) — see docs/adr/0002-currency-pkr-integer-amounts.md.
// The app has no released data yet, so this starts a fresh file rather than
// migrating the old column in place.
export function AppDatabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName="money_tracker_v3.db" onInit={initializeDatabase}>
      {children}
    </SQLiteProvider>
  );
}