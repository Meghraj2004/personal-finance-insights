
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO string
  userId: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // Format: 'YYYY-MM'
  userId: string;
}

export interface CategoryTotal {
  category: string;
  total: number;
  budget?: number;
  percentage?: number;
}

export interface MonthlyTotal {
  month: string;
  total: number;
}

export type ExpenseCategory = 
  'Housing' | 
  'Transportation' | 
  'Food' | 
  'Utilities' | 
  'Insurance' | 
  'Healthcare' | 
  'Entertainment' | 
  'Personal' | 
  'Education' | 
  'Savings' | 
  'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Entertainment',
  'Personal',
  'Education',
  'Savings',
  'Other'
];

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}
