# 10. Edit and delete transactions

Date: 2026-09-14

## Status

Accepted

## Context

Delete only existed as an undiscoverable long-press on the dashboard's
"Recent Transactions" list — History had neither delete nor any way to fix
a mistyped entry (wrong amount, category, or date) short of deleting it and
re-entering it from scratch. There was no edit flow anywhere.

## Decision

- **Reuse the Add screen for editing**, rather than building a second
  screen. `/add` now accepts an optional `id` query param
  (`/add?id=123`); when present, it loads that row, prefills every field,
  and `handleSave` runs an `UPDATE` instead of an `INSERT`. Header title,
  save button label/icon, and a delete action (trash icon, top-right) all
  switch based on whether `id` was passed.
- Loading is gated behind a `loaded` flag so the form doesn't flash
  default values (wrong category list, etc.) before the existing row
  arrives from SQLite — for a local on-device query this is normally
  imperceptible, but it's cheap insurance.
- The Expense/Income toggle's `onPress` now sets `type` and resets
  `category` together in one handler (`selectType`), instead of the
  previous `useEffect` keyed on `type`. That effect would have fired
  during the edit-load too and stomped the just-loaded category back to
  the list's first entry — an explicit handler only runs on a real user
  tap.
- **Interaction convention**: tap a transaction row to edit it, long-press
  to delete it (with an "are you sure" confirm) — applied consistently to
  both the dashboard's recent list and History's full list. This matches
  the delete gesture that already existed on the dashboard, rather than
  introducing a second, different pattern (e.g. swipe actions) for what's
  otherwise the same two operations in two places.

## Consequences

- One form to maintain for both add and edit, at the cost of a bit of
  conditional logic (`isEditing` branches for copy, icon, and the
  save/delete queries).
- No visual affordance signals that rows are tappable/long-press-able
  beyond `activeOpacity` feedback — consistent with the app's existing
  minimal style, but worth revisiting if it turns out not to be
  discoverable in practice.
