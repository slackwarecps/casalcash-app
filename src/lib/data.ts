import { Expense, Loan } from './types';

export const initialExpenses: Expense[] = [
  {
    id: '1',
    description: 'Aluguel',
    amount: 2500,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Moradia',
    date: new Date('2024-07-10T10:00:00Z'),
  },
  {
    id: '2',
    description: 'Pizzaria',
    amount: 120,
    paidBy: 'Tati',
    split: '50/50',
    category: 'Alimentação',
    date: new Date('2024-07-08T20:00:00Z'),
  },
    {
    id: '3',
    description: 'Veterinário - Paçoca',
    amount: 350,
    paidBy: 'Tati',
    split: '100% Tati',
    category: 'Pet',
    date: new Date('2024-07-05T15:00:00Z'),
  },
  {
    id: '4',
    description: 'Energia',
    amount: 180,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Moradia',
    date: new Date('2024-07-01T12:00:00Z'),
  },
];

export const initialLoans: Loan[] = [
    {
        id: 'l1',
        description: 'Máquina de Lavar',
        totalAmount: 2773.92, // 24 * 115.58
        lender: 'Fabão',
        borrower: 'Tati',
        installments: 24,
        paidInstallments: 8, // Assuming payments from Dec/2023 to Jul/2024
        date: new Date('2023-12-04T10:00:00Z'),
    },
    {
        id: 'l2',
        description: 'Cama Queen',
        totalAmount: 4000,
        lender: 'Fabão',
        borrower: 'Tati',
        installments: 20,
        paidInstallments: 0,
        date: new Date('2025-07-04T10:00:00Z'),
    }
];
