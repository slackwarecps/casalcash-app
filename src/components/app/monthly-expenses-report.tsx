'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as UiTableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyExpensesReportProps {
  expenses: Expense[];
  isLoading?: boolean;
}

export default function MonthlyExpensesReport({ expenses, isLoading }: MonthlyExpensesReportProps) {
  
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Geral de Despesas do Mês</CardTitle>
        <CardDescription>
          {isLoading ? 'Carregando despesas...' : `Todos os ${expenses.length} lançamentos do mês, ordenados por data.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Pago por</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Rateio</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Nenhuma despesa encontrada para este mês.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{format(expense.date as Date, "dd/MM/yy", { locale: ptBR })}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>
                    <Badge variant={expense.paidBy === 'Fabão' ? 'default' : 'secondary'}>
                      {expense.paidBy}
                    </Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{expense.split}</Badge></TableCell>
                  <TableCell>
                      <Badge variant={expense.tipoDespesa === 'recorrente' ? 'destructive' : 'secondary'} className="capitalize">
                          {expense.tipoDespesa === 'recorrente' ? 'Fixa' : 'Variável'}
                      </Badge>
                  </TableCell>
                  <TableCell>
                      <div className="flex items-center gap-1">
                       {expense.isPaid ? (
                          <CheckCircle className="h-4 w-4 text-green-600"/>
                      ) : (
                          <XCircle className="h-4 w-4 text-red-600"/>
                      )}
                      <span className='sr-only'>{expense.isPaid ? 'Pago' : 'Não Pago'}</span>
                      </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <UiTableFooter>
              <TableRow>
                  <TableCell className="text-right font-bold text-lg">Total do Mês</TableCell>
                  <TableCell className="text-right font-bold text-lg">{formatCurrency(totalAmount)}</TableCell>
                  <TableCell colSpan={6}></TableCell>
              </TableRow>
          </UiTableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
