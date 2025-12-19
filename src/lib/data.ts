import { Expense, Loan } from './types';

export const initialExpenses: Expense[] = [
  {
    id: '1',
    description: 'Aluguel',
    amount: 2500,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Moradia',
    date: new Date(),
  },
  {
    id: '2',
    description: 'Pizzaria',
    amount: 120,
    paidBy: 'Tati',
    split: '50/50',
    category: 'Alimentação',
    date: new Date(),
  },
    {
    id: '3',
    description: 'Veterinário - Paçoca',
    amount: 350,
    paidBy: 'Tati',
    split: '100% Tati',
    category: 'Pet',
    date: new Date(),
  },
  {
    id: '4',
    description: 'Energia',
    amount: 180,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Moradia',
    date: new Date(),
  },
];

export const initialLoans: Loan[] = [
    {
        id: 'l1',
        description: 'Notebook Tati',
        totalAmount: 5000,
        lender: 'Fabão',
        borrower: 'Tati',
        installments: 10,
        paidInstallments: 3,
        date: new Date(new Date().setMonth(new Date().getMonth() - 4)),
    },
    {
        id: 'l2',
        description: 'Máquina de Lavar',
        totalAmount: 2200,
        lender: 'Tati',
        borrower: 'Fabão',
        installments: 5,
        paidInstallments: 1,
        date: new Date(new Date().setMonth(new Date().getMonth() - 2)),
    }
];
