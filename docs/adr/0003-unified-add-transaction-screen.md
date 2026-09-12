# 3. Unified Add screen for income and expenses

Date: 2026-09-12

## Status

Accepted

## Context

The app could only record expenses — `type` was hardcoded to `'expense'` in
`src/app/add.tsx` even though the `transactions` table and every reporting
screen (home totals, history filters) already treated `type` as
`'income' | 'expense'`. There was no way to log a salary, gift, or other
income, which was one of the two things the user most wanted fixed.

Two approaches were considered:

1. A single Add screen with an Expense/Income toggle at the top.
2. A second, separate "Add Income" screen/route reached via its own action.

## Decision

Go with (1): one screen, one route (`/add`), with a segmented Expense/Income
toggle. Selecting a type swaps the category grid to a type-specific list
(`getCategoriesFor` in `src/constants/categories.ts`) and switches the
header/button copy and accent color.

## Consequences

- One save flow, one set of form state, one place to fix bugs — no separate
  screen to keep in sync as fields change.
- Income needed its own small category set — Salary, Business, Gift, Other —
  distinct from expense categories, now centralized alongside the expense
  ones in `src/constants/categories.ts` rather than duplicated per screen.
- The FAB on the dashboard still opens a single `/add` route; users pick the
  type inside rather than being asked to pick a route first.
