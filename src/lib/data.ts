import { addMonths } from 'date-fns';
import { Expense, Loan, Installment } from './types';

export const initialExpenses: Omit<Expense, 'id'>[] = [];

export const initialLoans: Omit<Loan, 'id'>[] = [];
