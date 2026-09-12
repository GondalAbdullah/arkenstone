# 2. Currency: Pakistani Rupees as integer amounts

Date: 2026-09-12

## Status

Accepted

## Context

The app previously used a US-style `$` symbol and stored `amount` as SQLite
`REAL`, with two-decimal formatting (`0.00`) implying cents. The app's only
real user is in Pakistan, uses Pakistani Rupees, and — unlike US dollars —
Rupees have no everyday subunit: paisa hasn't circulated in normal use for
decades. Entering and displaying `1250.00` for a plain thousand-and-a-quarter
Rupee expense adds friction and a false sense of fractional precision, and
`REAL` columns for money invite floating-point rounding drift over time.

## Decision

- Amounts are whole Rupees, stored as SQLite `INTEGER`, displayed as
  `Rs. 1,234` (see `src/utils/currency.ts`).
- No decimal/paisa entry anywhere in the UI — the amount keypad
  (see [0004](0004-custom-numeric-keypad.md)) only has digits 0-9.
- Because this is a pre-release app with no user data to preserve, the
  database file was renamed `money_tracker_v2.db` → `money_tracker_v3.db`
  (see `src/db/database.tsx`) to start with the new integer schema cleanly,
  instead of writing a migration for data that was never shipped.

## Consequences

- Simpler, exact arithmetic — no floating-point summation error in totals.
- If multi-currency support is ever wanted, this decision needs revisiting;
  for now the app is single-currency (PKR) by design, matching its one user.
- Lakh/crore-style grouping (common in Pakistani/Indian numerals, e.g.
  `1,00,000` instead of `100,000`) was intentionally **not** implemented —
  `formatAmount` uses plain international thousands grouping for simplicity.
  Worth revisiting later if it reads awkwardly in daily use.
