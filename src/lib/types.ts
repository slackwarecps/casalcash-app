export type User = "Fabão" | "Tati";

export type Category = "Moradia" | "Transporte" | "Alimentação" | "Lazer" | "Saúde" | "Outros" | "Pet";

export const categories: Category[] = ["Moradia", "Transporte", "Alimentação", "Lazer", "Saúde", "Outros", "Pet"];

export type SplitType = "50/50" | "100% Fabão" | "100% Tati";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: User;
  split: SplitType;
  category: Category;
  date: Date;
}

export interface Installment {
  id: string;
  loanId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date | null;
  isPaid: boolean;
}

export interface Loan {
  id: string;
  description: string;
  totalAmount: number;
  lender: User;
  borrower: User;
  installments: number;
  paidInstallments: number; // This will be calculated from installments array
  date: Date;
  installmentDetails: Installment[];
}
