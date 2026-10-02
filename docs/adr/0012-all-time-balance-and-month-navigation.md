# 12. Dashboard balance is all-time; add month navigation to Category Breakdown

Date: 2026-10-02

## Status

Accepted

## Context

Reported bug: on October 1st, the dashboard's income and "Current balance"
appeared to reset, and the Category Breakdown screen showed nothing — while
History still listed every past transaction correctly. No data was lost.

The actual cause: `index.tsx`'s dashboard query scoped *everything* —
including the figure displayed as "Current balance" — to the current
calendar month:

```sql
SELECT type, SUM(amount) as total FROM transactions
WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now', 'localtime')
GROUP BY type;
```

`balance = totals.income - totals.expense` was built directly from this.
"Current balance" is supposed to mean a running total — how much money you
actually have — not "this month's net". The moment a new month started
with nothing recorded in it yet, the balance display dropped to ~0,
silently discarding every prior month's saved total from view (the data
itself was always intact in SQLite; only the dashboard's query was wrong).

Category Breakdown had the same current-month scoping by design (a
category breakdown naturally wants to be period-scoped), but with no way
to move to a different period — so once the month changed, there was no
way to ever look at last month's spending breakdown again. The user's own
framing: "even though the monthly system is added, there is no benefit to
it, if I can't see it again."

## Decision

**Dashboard (`index.tsx`):** split the one month-scoped query into two:
- `totals` (income/expense feeding "Current balance") is now a plain
  `SUM(amount) GROUP BY type` over **all transactions, no date filter** —
  a true running balance.
- A new `monthExpense` state keeps the current-month scoping, used only by
  the "Total spent (this month)" card and its "vs last month" badge, which
  *are* meant to be period figures.

Relabeled the balance card's breakdown row "Income"/"Expenses" to "Total
income"/"Total expenses" so it's unambiguous that these are lifetime
figures distinct from the monthly card below them.

**Category Breakdown (`categories.tsx`):** added month navigation — `‹` /
`›` arrows around a month label, defaulting to the current month. The
underlying query now takes the selected month as a bound parameter instead
of hardcoding `'now'`. The `›` arrow disables at the current month (no
reason to query the future); tapping the month label itself jumps back to
the current month as a shortcut. Ring label and empty-state text adapt to
whether the selected month is the current one.

## Consequences

- "Current balance" on the dashboard now means what it says. The weekly
  bar chart and "this month" spend card remain intentionally
  current-month-only quick-glance widgets — Category Breakdown is now the
  place for reviewing a past month.
- History was left untouched — it already lists everything chronologically
  with no period scoping, so it wasn't part of this bug.
- No database/schema change and no migration — this was a query-scoping
  and UI bug, not a data problem.
