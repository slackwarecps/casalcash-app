'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HandCoins, Loader2, Trash2, ChevronRight, CalendarClock, CheckCircle, Hourglass } from 'lucide-react';
import type { Loan, User } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '../ui/badge';

interface LoanListProps {
  loans: Loan[];
  onPayInstallment: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function LoanList({ loans, onPayInstallment, onDelete, isLoading }: LoanListProps) {
  const [borrowerFilter, setBorrowerFilter] = useState<User | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paidOff'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const filteredLoans = useMemo(() => {
    return loans
      .filter(loan => borrowerFilter === 'all' || loan.borrower === borrowerFilter)
      .filter(loan => {
        if (statusFilter === 'all') return true;
        const isPaidOff = loan.paidInstallments >= loan.installments;
        return statusFilter === 'paidOff' ? isPaidOff : !isPaidOff;
      });
  }, [loans, borrowerFilter, statusFilter]);

  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const paginatedLoans = useMemo(() => {
    // Reset to page 1 if filters change and current page becomes invalid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    return filteredLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredLoans, currentPage, itemsPerPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleItemsPerPageChange = (value: string) => {
      setItemsPerPage(Number(value));
      setCurrentPage(1); // Reset to first page
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Empréstimos e Parcelas</CardTitle>
        <CardDescription>Controle de empréstimos e compras parceladas.</CardDescription>
         <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <Select value={borrowerFilter} onValueChange={(value: User | 'all') => { setBorrowerFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por devedor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Devedores</SelectItem>
                <SelectItem value="Fabão">Fabão Deve</SelectItem>
                <SelectItem value="Tati">Tati Deve</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'paidOff') => { setStatusFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="paidOff">Quitados</SelectItem>
              </SelectContent>
            </Select>
          </div>
      </CardHeader>
      <CardContent>
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
                ) : paginatedLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    Nenhum empréstimo encontrado para este filtro.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLoans.map((loan) => {
                  const installmentValue = loan.totalAmount / loan.installments;
                  const progress = (loan.paidInstallments / loan.installments) * 100;
                  const isPaidOff = loan.paidInstallments >= loan.installments;
                  const firstInstallmentDate = loan.installmentDetails?.[0]?.dueDate;
                  const lastInstallmentDate = loan.installmentDetails?.[loan.installments - 1]?.dueDate;

                  return (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="font-medium">{loan.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {loan.borrower} deve a {loan.lender}
                        </div>
                        <div className="text-sm text-muted-foreground font-semibold">
                          {formatCurrency(installmentValue)} / mês
                        </div>
                        {firstInstallmentDate && lastInstallmentDate && (
                           <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <CalendarClock className="h-3 w-3" />
                                <span>
                                    {format(firstInstallmentDate, 'dd/MM/yy', { locale: ptBR })} - {format(lastInstallmentDate, 'dd/MM/yy', { locale: ptBR })}
                                </span>
                           </div>
                        )}
                         <Badge variant={isPaidOff ? 'secondary' : 'outline'} className={cn('mt-2', isPaidOff ? 'border-green-600' : '')}>
                           {isPaidOff ? <CheckCircle className="h-3 w-3 mr-1 text-green-600"/> : <Hourglass className="h-3 w-3 mr-1"/>}
                           {isPaidOff ? 'Quitado' : 'Ativo'}
                         </Badge>
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Itens por pág:</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                </SelectContent>
            </Select>
            </div>
            <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
            >
                Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
                Página {totalPages > 0 ? currentPage : 0} de {totalPages}
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading || totalPages === 0}
            >
                Próximo
            </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
