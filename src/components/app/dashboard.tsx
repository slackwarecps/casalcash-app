'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, User, Users } from 'lucide-react';
import type { Expense, Loan, User as UserType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { reconcileDebtsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DebtReconciliationOutput } from '@/ai/flows/debt-reconciliation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DashboardProps {
  expenses: Expense[];
  loans: Loan[];
  currentUser: UserType;
}

export default function Dashboard({ expenses, loans, currentUser }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<DebtReconciliationOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const { toast } = useToast();

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const fabaoPaid = expenses
    .filter(e => e.paidBy === 'Fabão')
    .reduce((acc, exp) => acc + exp.amount, 0);
  const tatiPaid = expenses
    .filter(e => e.paidBy === 'Tati')
    .reduce((acc, exp) => acc + exp.amount, 0);

  const handleReconciliation = async () => {
    setIsLoading(true);
    setAiResult(null);
    setAiError(null);

    const partner1Name = 'Fabão';
    const partner2Name = 'Tati';

    const debts = expenses.map(expense => {
      let from: UserType, to: UserType, amount = 0;
      if (expense.split === '50/50') {
          from = expense.paidBy;
          to = from === 'Fabão' ? 'Tati' : 'Fabão';
          amount = expense.amount / 2;
      } else if (expense.split === '100% Fabão' && expense.paidBy === 'Tati') {
          from = 'Tati';
          to = 'Fabão';
          amount = expense.amount;
      } else if (expense.split === '100% Tati' && expense.paidBy === 'Fabão') {
          from = 'Fabão';
          to = 'Tati';
          amount = expense.amount;
      } else {
        return null;
      }

      return {
        from,
        to,
        amount,
        description: `Despesa: ${expense.description}`,
      }
    }).filter(Boolean);

    const loanDebts = loans.map(loan => {
      if (loan.paidInstallments < loan.installments) {
        return {
          from: loan.borrower,
          to: loan.lender,
          amount: loan.totalAmount / loan.installments,
          description: `Parcela do empréstimo: ${loan.description}`
        }
      }
      return null;
    }).filter(Boolean);
    
    // @ts-ignore
    const allDebts = [...debts, ...loanDebts];

    const result = await reconcileDebtsAction({
      debts: allDebts,
      partner1Name,
      partner2Name,
    });
    
    if (result.success && result.data) {
      setAiResult(result.data);
      toast({
        title: "Reconciliação completa!",
        description: "A IA analisou as contas.",
      });
    } else {
      setAiError(result.error || "Ocorreu um erro desconhecido.");
      toast({
        title: "Erro na reconciliação",
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Resumo do Mês</CardTitle>
        <CardDescription>Visão geral das finanças do casal.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fabão Pagou</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(fabaoPaid)}</div>
          </CardContent>
        </Card>
        <Card className="bg-background/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tati Pagou</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(tatiPaid)}</div>
          </CardContent>
        </Card>
        
        {(aiResult || aiError) && (
            <div className="md:col-span-3 mt-4 animate-in fade-in-50 duration-500">
                {aiResult && (
                    <Alert className="border-accent bg-accent/10">
                        <Sparkles className="h-4 w-4 !text-accent" />
                        <AlertTitle className="text-accent font-bold">Resumo da IA</AlertTitle>
                        <AlertDescription className="text-foreground">
                            {aiResult.summary.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                        </AlertDescription>
                    </Alert>
                )}
                {aiError && (
                    <Alert variant="destructive">
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>{aiError}</AlertDescription>
                    </Alert>
                )}
            </div>
        )}

      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <p className="text-sm text-muted-foreground">
          Clique para usar a IA e descobrir o balanço final do mês, incluindo despesas e parcelas de empréstimos.
        </p>
        <Button onClick={handleReconciliation} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Calculando...' : 'Reconciliar Dívidas com IA'}
        </Button>
      </CardFooter>
    </Card>
  );
}
