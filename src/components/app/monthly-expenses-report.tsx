'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as UiTableFooter } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

interface MonthlyExpensesReportProps {
  expenses: Expense[];
  isLoading?: boolean;
  onDelete?: (id: string, description: string) => void;
}

export default function MonthlyExpensesReport({ expenses, isLoading, onDelete }: MonthlyExpensesReportProps) {
  const router = useRouter();

  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);
  
  const handleRowClick = (expenseId: string) => {
    router.push(`/expenses/${expenseId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Relatório Geral de Despesas do Mês</CardTitle>
          <CardDescription>Carregando despesas...</CardDescription>
        </CardHeader>
        <CardContent className="h-48 flex items-center justify-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }
  
  if (expenses.length === 0) {
      return (
         <Card>
            <CardHeader>
                <CardTitle>Relatório Geral de Despesas do Mês</CardTitle>
                <CardDescription>Nenhuma despesa encontrada para este mês.</CardDescription>
            </CardHeader>
             <CardContent className="h-24 text-center flex items-center justify-center">
                 <p>Nenhuma despesa encontrada para este mês.</p>
             </CardContent>
        </Card>
      )
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório Geral de Despesas do Mês</CardTitle>
        <CardDescription>
          {`Todos os ${expenses.length} lançamentos do mês, ordenados por data.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-3">
          {expenses.map((expense) => (
             <div key={expense.id} className="p-4 border rounded-lg space-y-3">
                <div onClick={() => handleRowClick(expense.id)} className="cursor-pointer space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="font-medium pr-2 flex-1">{expense.description}</div>
                        <div className="font-bold text-lg whitespace-nowrap">{formatCurrency(expense.amount)}</div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{format(expense.date as Date, "dd/MM/yyyy", { locale: ptBR })}</span>
                        <Badge variant="outline">{expense.split}</Badge>
                    </div>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Pago por:</span>
                        <Badge variant={expense.paidBy === 'Fabão' ? 'fabao' : 'tati'}>
                            {expense.paidBy}
                        </Badge>
                    </div>
                    {onDelete && (
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso irá deletar permanentemente a despesa "{expense.description}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(expense.id, expense.description)}>Sim, excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
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
                {onDelete && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                  <TableRow key={expense.id} onClick={() => handleRowClick(expense.id)} className="cursor-pointer">
                    <TableCell>{format(expense.date as Date, "dd/MM/yy", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant={expense.paidBy === 'Fabão' ? 'fabao' : 'tati'}>
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
                    {onDelete && (
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso irá deletar permanentemente a despesa "{expense.description}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(expense.id, expense.description)}>Sim, excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
            <UiTableFooter>
                <TableRow>
                    <TableCell>Total do Mês</TableCell>
                    <TableCell className="text-right font-bold text-lg">{formatCurrency(totalAmount)}</TableCell>
                    <TableCell colSpan={onDelete ? 7 : 6}></TableCell>
                </TableRow>
            </UiTableFooter>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="md:hidden">
          <div className="w-full flex justify-between items-center text-lg font-bold p-2 border-t">
              <span>Total do Mês</span>
              <span>{formatCurrency(totalAmount)}</span>
          </div>
      </CardFooter>
    </Card>
  );
}
