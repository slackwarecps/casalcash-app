'use client';
import { Timestamp } from "firebase/firestore";

export type User = "Fabão" | "Tati";

export type Category = "Moradia" | "Transporte" | "Alimentação" | "Lazer" | "Saúde" | "Outros" | "Pet";

export const categories: Category[] = ["Moradia", "Transporte", "Alimentação", "Lazer", "Saúde", "Outros", "Pet"];

export type SplitType = "50/50" | "100% Fabão" | "100% Tati";

interface FirestoreDoc {
    members?: { [key: string]: 'owner' | 'editor' | 'viewer' };
}

export interface Expense extends FirestoreDoc {
  id: string;
  description: string;
  amount: number;
  paidBy: User;
  split: SplitType;
  category: Category;
  date: Date | Timestamp;
}

export interface Installment {
  id: string;
  loanId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date | Timestamp;
  paidDate?: Date | Timestamp | null;
  isPaid: boolean;
}

export interface Loan extends FirestoreDoc {
  id: string;
  description: string;
  totalAmount: number;
  lender: User;
  borrower: User;
  installments: number;
  paidInstallments: number;
  date: Date | Timestamp;
  installmentDetails: Installment[];
}

export interface RecurringExpense extends FirestoreDoc {
  id: string;
  dayOfMonth: number;
  description: string;
  category: Category;
  amount: number;
  split: SplitType;
  paidBy: User;
}