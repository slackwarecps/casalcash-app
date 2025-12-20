'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trash2, Pencil } from 'lucide-react';
import type { PreCredit } from '@/lib/types';
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
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PreCreditListProps {
  preCredits: PreCredit[];
  onEdit: (credit: PreCredit) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export default function PreCreditList({ preCredits, onEdit, onDelete, isLoading }: PreCreditListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Pré-Créditos</CardTitle>
        <CardDescription>
          {isLoading ? 'Carregando pré-créditos...' : `Exibindo ${preCredits.length} pré-créditos para o mês.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-60">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : preCredits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    Nenhum pré-crédito encontrado para este mês.
                  </TableCell>
                </TableRow>
              ) : (
                preCredits.map((credit) => (
                  <TableRow key={credit.id}>
                    <TableCell>
                      {format(credit.date as Date, "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{credit.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={credit.author === 'Fabão' ? 'default' : 'secondary'}>
                        {credit.author}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(credit.amount)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(credit)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o pré-crédito "{credit.description}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(credit.id)}>Deletar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
