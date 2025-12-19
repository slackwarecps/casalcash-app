import { addMonths } from 'date-fns';
import { Expense, Loan, Installment } from './types';

const generateInstallments = (loan: Omit<Loan, 'installmentDetails' | 'paidInstallments' | 'id'> & {id: string}, paidUntil: Date): Pick<Loan, 'installmentDetails' | 'paidInstallments'> => {
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

const paidUntilDate = new Date('2025-11-30T12:00:00Z');

const loan1Base = {
  id: 'l1',
  description: 'Máquina de Lavar',
  totalAmount: 2773.92, // 24 * 115.58
  lender: 'Fabão' as const,
  borrower: 'Tati' as const,
  installments: 24,
  date: new Date('2023-12-04T12:00:00Z'),
};
const loan1Details = generateInstallments(loan1Base, paidUntilDate);

const loan2Base = {
  id: 'l2',
  description: 'Cama Queen',
  totalAmount: 3047.60, // 20 * 152.38
  lender: 'Fabão' as const,
  borrower: 'Tati' as const,
  installments: 20,
  date: new Date('2025-07-04T12:00:00Z'),
};
const loan2Details = generateInstallments(loan2Base, paidUntilDate);


const loan3Base = {
  id: 'l3',
  description: 'Miami Tenis',
  totalAmount: 2090.00, // 10 * 209.00
  lender: 'Fabão' as const,
  borrower: 'Tati' as const,
  installments: 10,
  date: new Date('2025-10-04T12:00:00Z'),
};
const loan3Details = generateInstallments(loan3Base, paidUntilDate);


export const initialExpenses: Omit<Expense, 'id'>[] = [
    { description: 'faxina', amount: 500.00, paidBy: 'Fabão', split: '50/50', category: 'Moradia', date: new Date('2025-10-08T12:00:00Z') },
    { description: 'cpfl', amount: 517.00, paidBy: 'Fabão', split: '50/50', category: 'Moradia', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'sanasa', amount: 0.00, paidBy: 'Fabão', split: '50/50', category: 'Moradia', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'aluguel', amount: 2949.69, paidBy: 'Fabão', split: '50/50', category: 'Moradia', date: new Date('2025-10-09T12:00:00Z') },
    { description: 'alimentacao', amount: 1440.00, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-05T12:00:00Z') },
    { description: 'internet', amount: 303.33, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'alimentacao', amount: 213.00, paidBy: 'Tati', split: '100% Fabão', category: 'Alimentação', date: new Date('2025-10-01T12:00:00Z') },
    { description: 'alimentacao', amount: 39.58, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-28T12:00:00Z') },
    { description: 'alimentacao', amount: 77.61, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-27T12:00:00Z') },
    { description: 'alimentacao', amount: 59.98, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-26T12:00:00Z') },
    { description: 'diversos', amount: 138.09, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-26T12:00:00Z') },
    { description: 'diversos', amount: 24.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-26T12:00:00Z') },
    { description: 'diversos', amount: 19.99, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-25T12:00:00Z') },
    { description: 'diversos', amount: 142.45, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-25T12:00:00Z') },
    { description: 'diversos', amount: 97.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-25T12:00:00Z') },
    { description: 'alimentacao', amount: 59.90, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-24T12:00:00Z') },
    { description: 'diversos', amount: 20.49, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T12:00:00Z') },
    { description: 'diversos', amount: 12.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T12:00:00Z') },
    { description: 'diversos', amount: 32.83, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T12:00:00Z') },
    { description: 'diversos', amount: 23.75, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T12:00:00Z') },
    { description: 'diversos', amount: 75.60, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T12:00:00Z') },
    { description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T12:00:00Z') },
    { description: 'diversos', amount: 157.30, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T12:00:00Z') },
    { description: 'diversos', amount: 70.07, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T12:00:00Z') },
    { description: 'diversos', amount: 178.67, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 60.79, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 242.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 24.20, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 9.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T12:00:00Z') },
    { description: 'diversos', amount: 60.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T12:00:00Z') },
    { description: 'diversos', amount: 23.80, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T12:00:00Z') },
    { description: 'diversos', amount: 94.94, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T12:00:00Z') },
    { description: 'diversos', amount: 62.30, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T12:00:00Z') },
    { description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T12:00:00Z') },
    { description: 'diversos', amount: 8.50, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T12:00:00Z') },
    { description: 'diversos', amount: 59.24, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'diversos', amount: 62.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'diversos', amount: 20.20, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'diversos', amount: 11.10, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'diversos', amount: 1.75, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'diversos', amount: 720.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'diversos', amount: 162.58, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'diversos', amount: 160.13, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-19T12:00:00Z') },
    { description: 'diversos', amount: 170.52, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-19T12:00:00Z') },
    { description: 'diversos', amount: 19.60, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T12:00:00Z') },
    { description: 'diversos', amount: 21.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T12:00:00Z') },
    { description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T12:00:00Z') },
    { description: 'diversos', amount: 26.90, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T12:00:00Z') },
    { description: 'diversos', amount: 182.60, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T12:00:00Z') },
    { description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T12:00:00Z') },
    { description: 'diversos', amount: 6.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T12:00:00Z') },
    { description: 'diversos', amount: 119.90, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T12:00:00Z') },
    { description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T12:00:00Z') },
    { description: 'diversos', amount: 217.26, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T12:00:00Z') },
    { description: 'diversos', amount: 45.50, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T12:00:00Z') },
    { description: 'diversos', amount: 132.33, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T12:00:00Z') },
    { description: 'diversos', amount: 221.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T12:00:00Z') },
    { description: 'diversos', amount: 12.90, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T12:00:00Z') },
    { description: 'diversos', amount: 60.27, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T12:00:00Z') },
    { description: 'diversos', amount: 199.84, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-15T12:00:00Z') },
    { description: 'diversos', amount: 89.76, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-15T12:00:00Z') },
    { description: 'diversos', amount: 14.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-14T12:00:00Z') },
    { description: 'diversos', amount: 68.89, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-14T12:00:00Z') },
    { description: 'diversos', amount: 17.90, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-13T12:00:00Z') },
    { description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-25T12:00:00Z') },
    { description: 'diversos', amount: 61.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T12:00:00Z') },
    { description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T12:00:00Z') },
    { description: 'diversos', amount: 183.70, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T12:00:00Z') },
    { description: 'diversos', amount: 25.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T12:00:00Z') },
    { description: 'diversos', amount: 19.99, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T12:00:00Z') },
    { description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 60.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 300.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 0.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 100.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T12:00:00Z') },
    { description: 'diversos', amount: 25.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T12:00:00Z') },
    { description: 'diversos', amount: 12.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-19T12:00:00Z') },
    { description: 'diversos', amount: 64.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T12:00:00Z') },
    { description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T12:00:00Z') },
    { description: 'diversos', amount: 50.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T12:00:00Z') },
    { description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T12:00:00Z') },
    { description: 'diversos', amount: 12.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T12:00:00Z') },
    { description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T12:00:00Z') },
    { description: 'diversos', amount: 83.33, paidBy: 'Tati', split: '50/50', category: 'Outros', date: new Date('2025-10-13T12:00:00Z') },
    { description: 'diversos', amount: 446.00, paidBy: 'Tati', split: '50/50', category: 'Outros', date: new Date('2025-10-13T12:00:00Z') },
    { description: 'diversos', amount: 55.00, paidBy: 'Tati', split: '50/50', category: 'Outros', date: new Date('2025-10-13T12:00:00Z') },
    { description: 'transporte', amount: 19.40, paidBy: 'Fabão', split: '100% Tati', category: 'Transporte', date: new Date('2025-10-27T12:00:00Z') },
    { description: 'transporte', amount: 11.00, paidBy: 'Fabão', split: '100% Tati', category: 'Transporte', date: new Date('2025-10-27T12:00:00Z') },
    { description: 'transporte', amount: 13.80, paidBy: 'Fabão', split: '100% Tati', category: 'Transporte', date: new Date('2025-10-27T12:00:00Z') },
    { description: 'transporte', amount: 19.40, paidBy: 'Fabão', split: '100% Tati', category: 'Transporte', date: new Date('2025-10-27T12:00:00Z') },
    { description: 'dividas', amount: 294.47, paidBy: 'Tati', split: '100% Fabão', category: 'Outros', date: new Date('2025-05-05T12:00:00Z') },
].sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime());

export const initialLoans: Omit<Loan, 'id'>[] = [
  { ...loan1Base, ...loan1Details },
  { ...loan2Base, ...loan2Details },
  { ...loan3Base, ...loan3Details },
].sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime());
