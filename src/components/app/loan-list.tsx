'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HandCoins, Loader2, Trash2, ChevronRight } from 'lucide-react';
import type { Loan } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
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
} from "@/components/ui/alert-dialog"

interface LoanListProps {
  loans: Loan[];
  onPayInstallment: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function LoanList({ loans, onPayInstallment, onDelete, isLoading }: LoanListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Empréstimos e Parcelas</CardTitle>
        <CardDescription>Controle de empréstimos e compras parceladas.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[28.5rem]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    </TableCell>
                  </TableRow>
                ) : loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    Nenhum empréstimo registrado.
                  </TableCell>
                </TableRow>
              ) : (
                loans.map((loan) => {
                  const installmentValue = loan.totalAmount / loan.installments;
                  const progress = (loan.paidInstallments / loan.installments) * 100;
                  const isPaidOff = loan.paidInstallments >= loan.installments;

                  return (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="font-medium">{loan.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {loan.borrower} deve a {loan.lender}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(installmentValue)} / mês
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Progress value={progress} className="w-full" />
                          <span className="text-xs text-muted-foreground">
                            {loan.paidInstallments} de {loan.installments} parcelas pagas
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); onPayInstallment(loan.id); }}
                          disabled={isPaidOff}
                          className="hidden sm:inline-flex"
                        >
                          <HandCoins className="h-4 w-4 mr-1" />
                          {isPaidOff ? 'Quitado' : 'Pagar Parcela'}
                        </Button>
                         <Link href={`/loans/${loan.id}`} passHref>
                           <Button variant="outline" size="icon" asChild>
                            <span aria-label={`Ver detalhes de ${loan.description}`}><ChevronRight className="h-4 w-4" /></span>
                           </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Isso irá deletar permanentemente o empréstimo
                                "{loan.description}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(loan.id); }}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
