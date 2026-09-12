import {
  Utensils,
  Car,
  ShoppingBag,
  Home as HomeIcon,
  FileText,
  Film,
  Heart,
  MoreHorizontal,
  Landmark,
  Briefcase,
  Gift,
  HandCoins,
  type LucideIcon,
} from 'lucide-react-native';
import type { TransactionType } from '@/db/types';

export interface CategoryDef {
  key: string;
  icon: LucideIcon;
  tint: string;
  color: string;
  /** Monthly budget in whole Rupees — expense categories only. */
  budget?: number;
  blurb?: string;
}

// Single source of truth for categories. Previously each screen (add, home,
// history, categories) kept its own category → icon map with slightly
// different keys ('Transit' vs 'Transport', 'Home' vs 'Housing', ...), so an
// entry saved from one screen could fall back to a generic icon everywhere
// else. Every screen now reads from here instead.
export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { key: 'Food', icon: Utensils, tint: '#E3EDE6', color: '#3B7A57', budget: 800, blurb: 'Groceries & Dining' },
  { key: 'Transit', icon: Car, tint: '#EAEAE7', color: '#5C6259', budget: 400, blurb: 'Fuel & Transport' },
  { key: 'Shop', icon: ShoppingBag, tint: '#F3E3D3', color: '#C1682F', budget: 300, blurb: 'Shopping & Retail' },
  { key: 'Home', icon: HomeIcon, tint: '#E7E3F5', color: '#6C5CB0', budget: 1500, blurb: 'Rent & Utilities' },
  { key: 'Bills', icon: FileText, tint: '#FBF0D9', color: '#B8860B', budget: 100, blurb: 'Bills & Subscriptions' },
  { key: 'Fun', icon: Film, tint: '#E4E2E1', color: '#4E635A', budget: 150, blurb: 'Entertainment' },
  { key: 'Health', icon: Heart, tint: '#F7E6E0', color: '#A63A3A', budget: 200, blurb: 'Health & Wellness' },
  { key: 'More', icon: MoreHorizontal, tint: '#E4E2E1', color: '#424845', budget: 250, blurb: 'Other Expenses' },
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { key: 'Salary', icon: Landmark, tint: '#E3EDE6', color: '#3B7A57' },
  { key: 'Business', icon: Briefcase, tint: '#E7E3F5', color: '#6C5CB0' },
  { key: 'Gift', icon: Gift, tint: '#F3E3D3', color: '#C1682F' },
  { key: 'Other', icon: HandCoins, tint: '#E4E2E1', color: '#424845' },
];

const FALLBACK: CategoryDef = { key: 'Other', icon: MoreHorizontal, tint: '#E4E2E1', color: '#424845' };

const BY_KEY = new Map<string, CategoryDef>(
  [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => [c.key, c])
);

export function getCategoriesFor(type: TransactionType): CategoryDef[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function getCategoryMeta(key: string): CategoryDef {
  return BY_KEY.get(key) ?? FALLBACK;
}
