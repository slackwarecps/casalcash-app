'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Loan } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parse, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COUPLE_ID = 'casalUnico'; // Hardcoded for simplicity

const formSchema = z.object({
  description: z.string().min(2, { message: 'Descrição deve ter pelo menos 2 caracteres.' }),
  totalAmount: z.coerce.number().positive({ message: 'Valor deve ser positivo.' }),
  lender: z.enum(['Fabão', 'Tati']),
  borrower: z.enum(['Fabão', 'Tati']),
  installments: z.coerce.number().int().min(1, { message: 'Mínimo de 1 parcela.' }),
  date: z.string().refine(val => /^\d{2}\/\d{2}\/\d{4}$/.test(val), {
    message: "Data deve estar no formato dd/mm/yyyy",
  }),
}).refine(data => data.lender !== data.borrower, {
  message: "Quem empresta e quem pega emprestado não podem ser a mesma pessoa.",
  path: ["borrower"],
});


export default function LoanDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const firestore = useFirestore();

  const loanDocRef = useMemoFirebase(() => {
    if (!id || !firestore) return null;
    return doc(firestore, 'couples', COUPLE_ID, 'loans', id as string);
  }, [firestore, id]);

  const { data: loanData, isLoading } = useDoc<Loan>(loanDocRef);
  const [localInstallments, setLocalInstallments] = useState(loanData?.installmentDetails || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (loanData) {
      form.reset({
        description: loanData.description,
        totalAmount: loanData.totalAmount,
        lender: loanData.lender,
        borrower: loanData.borrower,
        installments: loanData.installments,
        date: (loanData.date as Timestamp).toDate().toLocaleDateString('pt-BR'),
      });
      // Convert Timestamps to Dates for the UI state
      setLocalInstallments(loanData.installmentDetails.map(inst => ({
        ...inst,
        dueDate: (inst.dueDate as Timestamp).toDate(),
        paidDate: inst.paidDate ? (inst.paidDate as Timestamp).toDate() : null,
      })));
    }
  }, [loanData, form]);

  const handleStatusChange = (installmentId: string, isPaid: boolean) => {
    setLocalInstallments(prev =>
      prev.map(inst => {
        if (inst.id === installmentId) {
          return { ...inst, isPaid: isPaid, paidDate: isPaid ? new Date() : null };
        }
        return inst;
      })
    );
  };

  const handleSaveChanges = (values: z.infer<typeof formSchema>) => {
    if (!loanData || !loanDocRef) return;

    const paidCount = localInstallments.filter(inst => inst.isPaid).length;
    const parsedDate = parse(values.date, 'dd/MM/yyyy', new Date());

    let finalInstallments = localInstallments;

    // Recalculate installments if the amount or number of installments changed
    if (values.totalAmount !== loanData.totalAmount || values.installments !== loanData.installments) {
        const installmentAmount = values.totalAmount / values.installments;
        finalInstallments = Array.from({ length: values.installments }, (_, i) => {
            const existingInstallment = localInstallments[i];
            return {
                id: existingInstallment?.id || doc(collection(firestore, 'temp')).id,
                loanId: loanData.id,
                installmentNumber: i + 1,
                amount: installmentAmount,
                dueDate: addMonths(parsedDate, i),
                isPaid: existingInstallment?.isPaid || false,
                paidDate: existingInstallment?.paidDate || null,
            };
        });
    }

    const firestoreReadyLoan = {
      ...loanData, // Preserve original data
      ...values, // Apply form values
      date: Timestamp.fromDate(parsedDate),
      paidInstallments: paidCount,
      installmentDetails: finalInstallments.map(inst => ({
        ...inst,
        dueDate: Timestamp.fromDate(inst.dueDate as Date),
        paidDate: inst.paidDate ? Timestamp.fromDate(inst.paidDate as Date) : null,
      })),
    };
    
    setDocumentNonBlocking(loanDocRef, firestoreReadyLoan, { merge: true });
    router.back();
  };

  if (isLoading || !loanData) {
    return (
      <main className="container mx-auto p-4 md:p-8 flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }
  
  const progress = (localInstallments.filter(i => i.isPaid).length / form.getValues('installments')) * 100;
  const totalPaidInstallments = localInstallments.filter(i => i.isPaid).length;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveChanges)}>
            <CardHeader>
              <CardTitle className="text-3xl">Editar Empréstimo</CardTitle>
              <CardDescription>
                Altere os detalhes do empréstimo e o status das parcelas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Notebook novo" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Valor Total</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nº de Parcelas</FormLabel>
                        <FormControl>
                            <Input type="number" step="1" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <FormControl>
                        <Input placeholder="dd/mm/yyyy" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="lender"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quem emprestou/pagou</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Fabão">Fabão</SelectItem>
                            <SelectItem value="Tati">Tati</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="borrower"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Quem deve</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Fabão">Fabão</SelectItem>
                            <SelectItem value="Tati">Tati</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
            
              <div>
                <h3 className="text-lg font-semibold mb-2">Parcelas</h3>
                <div className="flex flex-col gap-2 mb-6">
                    <Progress value={progress} className="w-full h-3" />
                    <span className="text-sm text-muted-foreground">
                        {totalPaidInstallments} de {form.getValues('installments')} parcelas pagas ({formatCurrency(form.getValues('totalAmount'))})
                    </span>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Paga?</TableHead>
                      <TableHead>Nº da Parcela</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data de Vencimento</TableHead>
                      <TableHead>Data de Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localInstallments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell>
                          <Checkbox
                            checked={installment.isPaid}
                            onCheckedChange={(checked) => handleStatusChange(installment.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell>{installment.installmentNumber}</TableCell>
                        <TableCell>{formatCurrency(installment.amount)}</TableCell>
                        <TableCell>{format(installment.dueDate as Date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                        <TableCell>
                          {installment.paidDate ? format(installment.paidDate as Date, "dd/MM/yyyy", { locale: ptBR }) : 'Pendente'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button type="submit">
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Alterações
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}

    