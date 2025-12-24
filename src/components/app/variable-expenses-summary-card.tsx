'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, User } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface VariableExpensesSummaryCardProps {
  expenses: Expense[];
}

export default function VariableExpensesSummaryCard({ expenses }: VariableExpensesSummaryCardProps) {

  const { fabaoTotal, tatiTotal, totalVariable } = useMemo(() => {
    const variableExpenses = expenses.filter(e => e.tipoDespesa === 'pontual');
    
    const fabaoTotal = variableExpenses
      .filter(e => e.paidBy === 'Fabão')
      .reduce((sum, expense) => sum + expense.amount, 0);

    const tatiTotal = variableExpenses
      .filter(e => e.paidBy === 'Tati')
      .reduce((sum, expense) => sum + expense.amount, 0);
      
    const totalVariable = fabaoTotal + tatiTotal;

    return { fabaoTotal, tatiTotal, totalVariable };
  }, [expenses]);


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Wallet className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Despesas Variáveis</CardTitle>
                <CardDescription>Total gasto em compras pontuais no mês.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
            <div className='flex items-center gap-2'>
                <User className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Fabão Pagou</span>
            </div>
            <span className="font-bold text-blue-500">{formatCurrency(fabaoTotal)}</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-background/50">
            <div className='flex items-center gap-2'>
                <User className="h-5 w-5 text-pink-500" />
                <span className="font-medium">Tati Pagou</span>
            </div>
            <span className="font-bold text-pink-500">{formatCurrency(tatiTotal)}</span>
        </div>
        <Separator />
         <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-bold">Total Variável</span>
            <span className="text-xl font-bold">{formatCurrency(totalVariable)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
