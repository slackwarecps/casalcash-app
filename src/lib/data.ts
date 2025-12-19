import { addMonths } from 'date-fns';
import { Expense, Loan, Installment } from './types';

const generateInstallments = (loan: Omit<Loan, 'installmentDetails' | 'paidInstallments'>, paidUntil: Date): Pick<Loan, 'installmentDetails' | 'paidInstallments'> => {
  const installmentDetails: Installment[] = [];
  const installmentAmount = loan.totalAmount / loan.installments;
  let paidCount = 0;

  for (let i = 0; i < loan.installments; i++) {
    const dueDate = addMonths(loan.date, i);
    const isPaid = dueDate <= paidUntil;
    if (isPaid) {
      paidCount++;
    }
    installmentDetails.push({
      id: `${loan.id}-inst-${i + 1}`,
      loanId: loan.id,
      installmentNumber: i + 1,
      amount: installmentAmount,
      dueDate,
      isPaid,
      paidDate: isPaid ? dueDate : null,
    });
  }

  return { installmentDetails, paidInstallments: paidCount };
};

const paidUntilDate = new Date('2025-11-30T10:00:00Z');

const loan1Base = {
  id: 'l1',
  description: 'Máquina de Lavar',
  totalAmount: 2773.92, // 24 * 115.58
  lender: 'Fabão' as const,
  borrower: 'Tati' as const,
  installments: 24,
  date: new Date('2023-12-04T10:00:00Z'),
};
const loan1Details = generateInstallments(loan1Base, paidUntilDate);

const loan2Base = {
  id: 'l2',
  description: 'Cama Queen',
  totalAmount: 3047.60, // 20 * 152.38
  lender: 'Fabão' as const,
  borrower: 'Tati' as const,
  installments: 20,
  date: new Date('2025-07-04T10:00:00Z'),
};
const loan2Details = generateInstallments(loan2Base, paidUntilDate);


const loan3Base = {
  id: 'l3',
  description: 'Miami Tenis',
  totalAmount: 2090.00, // 10 * 209.00
  lender: 'Fabão' as const,
  borrower: 'Tati' as const,
  installments: 10,
  date: new Date('2025-10-04T10:00:00Z'),
};
const loan3Details = generateInstallments(loan3Base, paidUntilDate);


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
  { ...loan1Base, ...loan1Details },
  { ...loan2Base, ...loan2Details },
  { ...loan3Base, ...loan3Details },
];
