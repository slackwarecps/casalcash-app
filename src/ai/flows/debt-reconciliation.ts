'use server';

/**
 * @fileOverview Debt reconciliation flow using Genkit to determine the net amount one partner owes the other.
 *
 * - reconcileDebts - A function that reconciles debts between two partners.
 * - DebtReconciliationInput - The input type for the reconcileDebts function.
 * - DebtReconciliationOutput - The return type for the reconcileDebts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DebtEntrySchema = z.object({
  from: z.string().describe('The name of the person who made the payment or loaned the money.'),
  to: z.string().describe('The name of the person who benefits from the payment or owes the money.'),
  amount: z.number().describe('The amount of the payment or loan.'),
  description: z.string().optional().describe('A description of the payment or loan.'),
});

const DebtReconciliationInputSchema = z.object({
  debts: z.array(DebtEntrySchema).describe('An array of debts between the two partners.'),
  partner1Name: z.string().describe('The name of the first partner.'),
  partner2Name: z.string().describe('The name of the second partner.'),
});

export type DebtReconciliationInput = z.infer<typeof DebtReconciliationInputSchema>;

const DebtReconciliationOutputSchema = z.object({
  summary: z.string().describe('A summary of who owes whom and how much, considering all debts.'),
});

export type DebtReconciliationOutput = z.infer<typeof DebtReconciliationOutputSchema>;

export async function reconcileDebts(input: DebtReconciliationInput): Promise<DebtReconciliationOutput> {
  return debtReconciliationFlow(input);
}

const debtReconciliationPrompt = ai.definePrompt({
  name: 'debtReconciliationPrompt',
  input: {schema: DebtReconciliationInputSchema},
  output: {schema: DebtReconciliationOutputSchema},
  prompt: `You are a financial advisor specializing in helping couples manage their finances. Based on the provided debt information between {{partner1Name}} and {{partner2Name}}, determine the net amount owed between them.  Consider all debts and provide a clear summary indicating who owes whom and the final amount.

Debts:
{{#each debts}}
- From: {{from}}, To: {{to}}, Amount: {{amount}}, Description: {{description}}
{{/each}}

Summarize the debts and net balance between {{partner1Name}} and {{partner2Name}}:
`,  
});

const debtReconciliationFlow = ai.defineFlow(
  {
    name: 'debtReconciliationFlow',
    inputSchema: DebtReconciliationInputSchema,
    outputSchema: DebtReconciliationOutputSchema,
  },
  async input => {
    const {output} = await debtReconciliationPrompt(input);
    return output!;
  }
);
