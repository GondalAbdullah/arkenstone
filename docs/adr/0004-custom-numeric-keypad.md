# 4. Custom in-app numeric keypad for amount entry

Date: 2026-09-12

## Status

Accepted

## Context

Amount entry used a plain `TextInput` with `keyboardType="decimal-pad"`,
opening the OS system keyboard. That keyboard still offers a decimal point
and a full row of symbols that don't apply once amounts are whole-Rupee
integers ([0002](0002-currency-pkr-integer-amounts.md)), and switching focus
between the system keyboard and the rest of the form (name, category, date)
adds visual noise for what should be a quick, single-purpose entry step.

Three scopes were considered for a custom keypad: digits + backspace only;
digits + backspace + quick-amount chips (e.g. +50/+100/+500 Rs); or digits
with basic arithmetic (`+`/`-`) for on-the-fly totals.

## Decision

Build a minimal custom keypad (`src/components/numeric-keypad.tsx`): a 0-9
grid plus a single backspace key (long-press clears the field). No decimal
point, no arithmetic, no quick-amount chips for v1. It replaces the
`TextInput` entirely in `src/app/add.tsx` — amount state is a plain digit
string, parsed with `parseAmountDigits`.

## Consequences

- Guarantees integer-only input at the source, rather than validating a
  string a system keyboard could type almost anything into.
- Simple enough to be trivially testable and to skin (colors follow the
  Expense/Income accent).
- Quick-amount chips and a calculator-style `+`/`-` were deliberately left
  out of scope; if data entry still feels slow in daily use, chips for
  common denominations are the more likely next addition.
