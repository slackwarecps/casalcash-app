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
    { id: 'e1', description: 'faxina', amount: 500.00, paidBy: 'Fabão', split: '50/50', category: 'Moradia', date: new Date('2025-10-08T10:00:00Z') },
    { id: 'e2', description: 'cpfl', amount: 517.00, paidBy: 'Fabão', split: '50/50', category: 'Moradia', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e3', description: 'sanasa', amount: 0.00, paidBy: 'Fabão', split: '50/50', category: 'Moradia', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e4', description: 'aluguel', amount: 2949.69, paidBy: 'Fabão', split: '50/50', category: 'Moradia', date: new Date('2025-10-09T10:00:00Z') },
    { id: 'e5', description: 'alimentacao', amount: 1440.00, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-05T10:00:00Z') },
    { id: 'e6', description: 'internet', amount: 303.33, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e7', description: 'alimentacao', amount: 213.00, paidBy: 'Tati', split: '100% Fabão', category: 'Alimentação', date: new Date('2025-10-01T10:00:00Z') },
    { id: 'e8', description: 'alimentacao', amount: 39.58, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-28T10:00:00Z') },
    { id: 'e9', description: 'alimentacao', amount: 77.61, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-27T10:00:00Z') },
    { id: 'e10', description: 'alimentacao', amount: 59.98, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-26T10:00:00Z') },
    { id: 'e11', description: 'diversos', amount: 138.09, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-26T10:00:00Z') },
    { id: 'e12', description: 'diversos', amount: 24.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-26T10:00:00Z') },
    { id: 'e13', description: 'diversos', amount: 19.99, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-25T10:00:00Z') },
    { id: 'e14', description: 'diversos', amount: 142.45, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-25T10:00:00Z') },
    { id: 'e15', description: 'diversos', amount: 97.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-25T10:00:00Z') },
    { id: 'e16', description: 'alimentacao', amount: 59.90, paidBy: 'Fabão', split: '50/50', category: 'Alimentação', date: new Date('2025-10-24T10:00:00Z') },
    { id: 'e17', description: 'diversos', amount: 20.49, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T10:00:00Z') },
    { id: 'e18', description: 'diversos', amount: 12.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T10:00:00Z') },
    { id: 'e19', description: 'diversos', amount: 32.83, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T10:00:00Z') },
    { id: 'e20', description: 'diversos', amount: 23.75, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T10:00:00Z') },
    { id: 'e21', description: 'diversos', amount: 75.60, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T10:00:00Z') },
    { id: 'e22', description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T10:00:00Z') },
    { id: 'e23', description: 'diversos', amount: 157.30, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T10:00:00Z') },
    { id: 'e24', description: 'diversos', amount: 70.07, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T10:00:00Z') },
    { id: 'e25', description: 'diversos', amount: 178.67, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e26', description: 'diversos', amount: 60.79, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e27', description: 'diversos', amount: 242.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e28', description: 'diversos', amount: 24.20, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e29', description: 'diversos', amount: 9.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T10:00:00Z') },
    { id: 'e30', description: 'diversos', amount: 60.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T10:00:00Z') },
    { id: 'e31', description: 'diversos', amount: 23.80, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T10:00:00Z') },
    { id: 'e32', description: 'diversos', amount: 94.94, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T10:00:00Z') },
    { id: 'e33', description: 'diversos', amount: 62.30, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T10:00:00Z') },
    { id: 'e34', description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T10:00:00Z') },
    { id: 'e35', description: 'diversos', amount: 8.50, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-21T10:00:00Z') },
    { id: 'e36', description: 'diversos', amount: 59.24, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e37', description: 'diversos', amount: 62.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e38', description: 'diversos', amount: 20.20, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e39', description: 'diversos', amount: 11.10, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e40', description: 'diversos', amount: 1.75, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e41', description: 'diversos', amount: 720.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e42', description: 'diversos', amount: 162.58, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e43', description: 'diversos', amount: 160.13, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-19T10:00:00Z') },
    { id: 'e44', description: 'diversos', amount: 170.52, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-19T10:00:00Z') },
    { id: 'e45', description: 'diversos', amount: 19.60, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T10:00:00Z') },
    { id: 'e46', description: 'diversos', amount: 21.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T10:00:00Z') },
    { id: 'e47', description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T10:00:00Z') },
    { id: 'e48', description: 'diversos', amount: 26.90, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T10:00:00Z') },
    { id: 'e49', description: 'diversos', amount: 182.60, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T10:00:00Z') },
    { id: 'e50', description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T10:00:00Z') },
    { id: 'e51', description: 'diversos', amount: 6.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T10:00:00Z') },
    { id: 'e52', description: 'diversos', amount: 119.90, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T10:00:00Z') },
    { id: 'e53', description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T10:00:00Z') },
    { id: 'e54', description: 'diversos', amount: 217.26, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T10:00:00Z') },
    { id: 'e55', description: 'diversos', amount: 45.50, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T10:00:00Z') },
    { id: 'e56', description: 'diversos', amount: 132.33, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T10:00:00Z') },
    { id: 'e57', description: 'diversos', amount: 221.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T10:00:00Z') },
    { id: 'e58', description: 'diversos', amount: 12.90, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T10:00:00Z') },
    { id: 'e59', description: 'diversos', amount: 60.27, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T10:00:00Z') },
    { id: 'e60', description: 'diversos', amount: 199.84, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-15T10:00:00Z') },
    { id: 'e61', description: 'diversos', amount: 89.76, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-15T10:00:00Z') },
    { id: 'e62', description: 'diversos', amount: 14.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-14T10:00:00Z') },
    { id: 'e63', description: 'diversos', amount: 68.89, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-14T10:00:00Z') },
    { id: 'e64', description: 'diversos', amount: 17.90, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-13T10:00:00Z') },
    { id: 'e65', description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-25T10:00:00Z') },
    { id: 'e66', description: 'diversos', amount: 61.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-24T10:00:00Z') },
    { id: 'e67', description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T10:00:00Z') },
    { id: 'e68', description: 'diversos', amount: 183.70, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T10:00:00Z') },
    { id: 'e69', description: 'diversos', amount: 25.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T10:00:00Z') },
    { id: 'e70', description: 'diversos', amount: 19.99, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-23T10:00:00Z') },
    { id: 'e71', description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e72', description: 'diversos', amount: 60.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e73', description: 'diversos', amount: 300.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e74', description: 'diversos', amount: 0.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e75', description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e76', description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e77', description: 'diversos', amount: 100.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-22T10:00:00Z') },
    { id: 'e78', description: 'diversos', amount: 25.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-20T10:00:00Z') },
    { id: 'e79', description: 'diversos', amount: 12.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-19T10:00:00Z') },
    { id: 'e80', description: 'diversos', amount: 64.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T10:00:00Z') },
    { id: 'e81', description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T10:00:00Z') },
    { id: 'e82', description: 'diversos', amount: 50.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-18T10:00:00Z') },
    { id: 'e83', description: 'diversos', amount: 10.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T10:00:00Z') },
    { id: 'e84', description: 'diversos', amount: 12.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-17T10:00:00Z') },
    { id: 'e85', description: 'diversos', amount: 20.00, paidBy: 'Fabão', split: '50/50', category: 'Outros', date: new Date('2025-10-16T10:00:00Z') },
    { id: 'e86', description: 'diversos', amount: 83.33, paidBy: 'Tati', split: '50/50', category: 'Outros', date: new Date('2025-10-13T10:00:00Z') },
    { id: 'e87', description: 'diversos', amount: 446.00, paidBy: 'Tati', split: '50/50', category: 'Outros', date: new Date('2025-10-13T10:00:00Z') },
    { id: 'e88', description: 'diversos', amount: 55.00, paidBy: 'Tati', split: '50/50', category: 'Outros', date: new Date('2025-10-13T10:00:00Z') },
    { id: 'e89', description: 'transporte', amount: 19.40, paidBy: 'Fabão', split: '100% Tati', category: 'Transporte', date: new Date('2025-10-27T10:00:00Z') },
    { id: 'e90', description: 'transporte', amount: 11.00, paidBy: 'Fabão', split: '100% Tati', category: 'Transporte', date: new Date('2025-10-27T10:00:00Z') },
    { id: 'e91', description: 'transporte', amount: 13.80, paidBy: 'Fabão', split: '100% Tati', category: 'Transporte', date: new Date('2025-10-27T10:00:00Z') },
    { id: 'e92', description: 'transporte', amount: 19.40, paidBy: 'Fabão', split: '100% Tati', category: 'Transporte', date: new Date('2025-10-27T10:00:00Z') },
    { id: 'e93', description: 'dividas', amount: 294.47, paidBy: 'Tati', split: '100% Fabão', category: 'Outros', date: new Date('2025-05-05T10:00:00Z') },
].sort((a, b) => b.date.getTime() - a.date.getTime());

export const initialLoans: Loan[] = [
  { ...loan1Base, ...loan1Details },
  { ...loan2Base, ...loan2Details },
  { ...loan3Base, ...loan3Details },
].sort((a, b) => b.date.getTime() - a.date.getTime());
