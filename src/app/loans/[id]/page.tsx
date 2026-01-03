'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Loan, Installment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parse, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDoc, useFirestore, setDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc, Timestamp, collection } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AddInstallmentPaymentDetailsDialog from '@/components/app/add-installment-payment-details-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


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
  const [localInstallments, setLocalInstallments] = useState<Installment[]>([]);
  const [editingPaymentFor, setEditingPaymentFor] = useState<Installment | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      totalAmount: 0,
      lender: 'Fabão',
      borrower: 'Tati',
      installments: 1,
      date: new Date().toLocaleDateString('pt-BR'),
    }
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
      const installmentsWithDates = loanData.installmentDetails.map(inst => ({
        ...inst,
        dueDate: (inst.dueDate as Timestamp).toDate(),
        paidDate: inst.paidDate ? (inst.paidDate as Timestamp).toDate() : null,
      }));
      setLocalInstallments(installmentsWithDates);
      form.setValue('installments', installmentsWithDates.length);
    }
  }, [loanData, form]);

  const handleStatusChange = (installment: Installment, isPaid: boolean) => {
    if (isPaid) {
      // If marking as paid, open the dialog to add details
      setEditingPaymentFor(installment);
    } else {
      // If un-marking, just update the state directly
      setLocalInstallments(prev =>
        prev.map(inst => {
          if (inst.id === installment.id) {
            return { ...inst, isPaid: false, paidDate: null, paymentDetails: '' };
          }
          return inst;
        })
      );
    }
  };
  
  const handleSavePaymentDetails = (installmentId: string, details: string) => {
     setLocalInstallments(prev =>
      prev.map(inst => {
        if (inst.id === installmentId) {
          return { ...inst, isPaid: true, paidDate: new Date(), paymentDetails: details };
        }
        return inst;
      })
    );
    setEditingPaymentFor(null); // Close the dialog
  }

  const handleDeleteInstallment = (installmentId: string) => {
    const updatedInstallments = localInstallments.filter(inst => inst.id !== installmentId);
    setLocalInstallments(updatedInstallments);
    // Update the form value to keep it controlled
    form.setValue('installments', updatedInstallments.length);
  };
  
  const handleSaveChanges = (values: z.infer<typeof formSchema>) => {
    if (!loanData || !loanDocRef || !firestore) return;
  
    const parsedDate = parse(values.date, 'dd/MM/yyyy', new Date());
  
    // Always use the latest state from localInstallments
    const numInstallments = localInstallments.length;
    const installmentAmount = numInstallments > 0 ? values.totalAmount / numInstallments : 0;
  
    // Re-calculate and re-number all installments based on the current local state
    const finalInstallments = localInstallments.map((inst, i) => ({
      ...inst,
      installmentNumber: i + 1,
      amount: installmentAmount,
      dueDate: addMonths(parsedDate, i), // Also recalculate due dates if start date changed
    }));
  
    const firestoreReadyLoan = {
      ...loanData, // Preserve original data
      ...values, // Apply form values
      installments: numInstallments, // Ensure count is correct
      date: Timestamp.fromDate(parsedDate),
      paidInstallments: finalInstallments.filter(inst => inst.isPaid).length,
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
  
  const progress = localInstallments.length > 0 ? (localInstallments.filter(i => i.isPaid).length / localInstallments.length) * 100 : 0;
  const totalPaidInstallments = localInstallments.filter(i => i.isPaid).length;

  return (
    <>
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
                              <Input type="number" {...field} readOnly />
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
                          {totalPaidInstallments} de {localInstallments.length} parcelas pagas ({formatCurrency(form.getValues('totalAmount'))})
                      </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Paga?</TableHead>
                        <TableHead>Nº</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Pagamento</TableHead>
                        <TableHead>Detalhes</TableHead>
                         <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localInstallments.map((installment, index) => (
                        <TableRow key={installment.id}>
                          <TableCell>
                            <Checkbox
                              checked={installment.isPaid}
                              onCheckedChange={(checked) => handleStatusChange(installment, !!checked)}
                            />
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{formatCurrency(installment.amount)}</TableCell>
                          <TableCell>{format(installment.dueDate as Date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                          <TableCell>
                            {installment.paidDate ? format(installment.paidDate as Date, "dd/MM/yyyy", { locale: ptBR }) : 'Pendente'}
                          </TableCell>
                           <TableCell className="text-sm text-muted-foreground">{installment.paymentDetails || '-'}</TableCell>
                           <TableCell className="text-right">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir Parcela?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        Tem certeza que deseja excluir a parcela {index + 1}? O valor total será redistribuído entre as parcelas restantes.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteInstallment(installment.id)}>
                                        Sim, excluir
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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
      {editingPaymentFor && (
        <AddInstallmentPaymentDetailsDialog
            installment={editingPaymentFor}
            isOpen={!!editingPaymentFor}
            onOpenChange={() => setEditingPaymentFor(null)}
            onSave={handleSavePaymentDetails}
        />
      )}
    </>
  );
}
