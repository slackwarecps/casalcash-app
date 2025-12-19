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
    id: 'e1',
    description: 'faxina',
    amount: 500.00,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Moradia',
    date: new Date('2025-10-08T10:00:00Z'),
  },
  {
    id: 'e2',
    description: 'cpfl 09/25',
    amount: 517.00,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Moradia',
    date: new Date('2025-10-20T10:00:00Z'),
  },
  {
    id: 'e3',
    description: 'sanasa 09/2025',
    amount: 0.00,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Moradia',
    date: new Date('2025-10-20T10:00:00Z'),
  },
  {
    id: 'e4',
    description: 'Aluguel',
    amount: 2949.69,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Moradia',
    date: new Date('2025-10-09T10:00:00Z'),
  },
  {
    id: 'e5',
    description: 'FLASH - Alimentacao Cartao Fabio',
    amount: 1440.00,
    paidBy: 'Fabão',
    split: '100% Fabão',
    category: 'Alimentação',
    date: new Date('2025-10-20T10:00:00Z'),
  },
  {
    id: 'e6',
    description: 'claro internet',
    amount: 303.33,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Outros',
    date: new Date('2025-10-20T10:00:00Z'),
  },
  {
    id: 'e7',
    description: 'Hospedagem 2 Recife ( vou pagar tudo de 1 vez )',
    amount: 213.00,
    paidBy: 'Fabão',
    split: '100% Tati',
    category: 'Lazer',
    date: new Date('2025-10-01T10:00:00Z'),
  },
  {
    id: 'e8',
    description: 'padaria cartao fabio',
    amount: 39.58,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Alimentação',
    date: new Date('2025-10-28T10:00:00Z'),
  },
  {
    id: 'e9',
    description: 'pagmenos fabio',
    amount: 77.61,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Saúde',
    date: new Date('2025-10-27T10:00:00Z'),
  },
  {
    id: 'e10',
    description: 'Oba - fabio',
    amount: 59.98,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Alimentação',
    date: new Date('2025-10-26T10:00:00Z'),
  },
  {
    id: 'e11',
    description: 'gasolina movida -cartao fabio',
    amount: 138.09,
    paidBy: 'Fabão',
    split: '50/50',
    category: 'Transporte',
    date: new Date('2025-10-26T10:00:00Z'),
  },
];

export const initialLoans: Loan[] = [
  { ...loan1Base, ...loan1Details },
  { ...loan2Base, ...loan2Details },
  { ...loan3Base, ...loan3Details },
];
