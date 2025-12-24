'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileStack, HandCoins, Loader2, PiggyBank, Sparkles, User, Users, CheckCheck, CircleAlert, CreditCard } from 'lucide-react';
import type { Expense, Loan, User as UserType, Category, PreCredit } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { reconcileDebtsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { DebtReconciliationOutput } from '@/ai/flows/debt-reconciliation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { addMonths, format, isSameMonth, isWithinInterval, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
  ChartLegendContent,
} from "@/components/ui/chart"

interface DashboardProps {
  expenses: Expense[];
  preCredits: PreCredit[];
  loans: Loan[];
  currentUser: UserType;
  selectedMonth: Date;
}

export default function Dashboard({ expenses, preCredits, loans, currentUser, selectedMonth }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<DebtReconciliationOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const { toast } = useToast();

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalPaid = expenses.filter(e => e.isPaid).reduce((acc, exp) => acc + exp.amount, 0);
  const totalUnpaid = totalExpenses - totalPaid;
  const pendingFixedExpenses = expenses.filter(e => e.tipoDespesa === 'recorrente' && !e.isPaid).length;

  const fabaoPaid = expenses
    .filter(e => e.paidBy === 'Fabão')
    .reduce((acc, exp) => acc + exp.amount, 0);
  const tatiPaid = expenses
    .filter(e => e.paidBy === 'Tati')
    .reduce((acc, exp) => acc + exp.amount, 0);
    
  const fabaoPreCredits = preCredits
    .filter(c => c.author === 'Fabão')
    .reduce((acc, c) => acc + c.amount, 0);
  const tatiPreCredits = preCredits
    .filter(c => c.author === 'Tati')
    .reduce((acc, c) => acc + c.amount, 0);
    
  const monthName = format(selectedMonth, 'MMMM', { locale: ptBR });

  const activeLoans = loans.filter(loan => loan.paidInstallments < loan.installments);
  const totalActiveLoans = activeLoans.length;

  const remainingLoanAmount = activeLoans.reduce((acc, loan) => {
    const installmentValue = loan.totalAmount / loan.installments;
    const remainingInstallments = loan.installments - loan.paidInstallments;
    return acc + (remainingInstallments * installmentValue);
  }, 0);
  
  const { chartData, chartConfig } = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount;
      return acc;
    }, {} as Record<Category, number>);

    const chartData = Object.entries(categoryTotals).map(([category, total]) => ({
      name: category,
      value: total,
    }));
    
    const chartConfig = chartData.reduce((acc, item, index) => {
        acc[item.name] = {
            label: item.name,
            color: `hsl(var(--chart-${(index % 5) + 1}))`
        };
        return acc;
    }, {} as ChartConfig);

    return { chartData, chartConfig };
  }, [expenses]);


  const handleReconciliation = async () => {
    setIsLoading(true);
    setAiResult(null);
    setAiError(null);

    const partner1Name = 'Fabão';
    const partner2Name = 'Tati';

    const expenseDebts = expenses.map(expense => {
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

    const loanDebts = loans.flatMap(loan => 
      loan.installmentDetails
        .filter(inst => isSameMonth(inst.dueDate as Date, selectedMonth) && !inst.isPaid)
        .map(inst => ({
            from: loan.borrower,
            to: loan.lender,
            amount: inst.amount,
            description: `Parcela do empréstimo (${inst.installmentNumber}/${loan.installments}): ${loan.description}`
        }))
    );
    
    const preCreditDebts = preCredits.map(credit => ({
        from: credit.author,
        to: credit.author === 'Fabão' ? 'Tati' : 'Fabão',
        amount: credit.amount,
        description: `Pré-crédito: ${credit.description}`
    }));
    
    // @ts-ignore
    const allDebts = [...expenseDebts, ...loanDebts, ...preCreditDebts];

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
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl capitalize">Resumo de {monthName}</CardTitle>
          <CardDescription>Visão geral das finanças do casal para o mês selecionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card className="bg-background/70">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total do Mês</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                  </CardContent>
              </Card>
              <Card className="bg-background/70">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Divisão por Dois</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(totalExpenses / 2)}</div>
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
              <Card className="bg-background/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pré-créditos Fabão</CardTitle>
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(fabaoPreCredits)}</div>
                </CardContent>
              </Card>
              <Card className="bg-background/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pré-créditos Tati</CardTitle>
                    <PiggyBank className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(tatiPreCredits)}</div>
                </CardContent>
              </Card>
              <Card className="bg-background/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Empréstimos Ativos</CardTitle>
                    <FileStack className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalActiveLoans}</div>
                </CardContent>
              </Card>
              <Card className="bg-background/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Falta Pagar (Emp.)</CardTitle>
                    <HandCoins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(remainingLoanAmount)}</div>
                </CardContent>
              </Card>
               <Card className="bg-background/70">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fixas Pendentes</CardTitle>
                    <CircleAlert className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingFixedExpenses}</div>
                </CardContent>
              </Card>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          { (aiResult || aiError) ? (
            <div className="w-full mt-4 animate-in fade-in-50 duration-500">
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
            ) : <p className="text-sm text-muted-foreground">Clique para usar a IA e descobrir o balanço final do mês, incluindo despesas, pré-créditos e parcelas de empréstimos.</p>
          }
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

      {chartData.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle>Gráficos de despesas</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[300px] flex flex-col justify-center">
                <ChartContainer config={chartConfig} className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent nameKey="value" formatter={(value, name) => `${formatCurrency(value as number)}`} />} />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    
                                    return (
                                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} />
                                ))}
                            </Pie>
                            <Legend content={<ChartLegendContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
