'use server';

import { reconcileDebts, DebtReconciliationInput, DebtReconciliationOutput } from '@/ai/flows/debt-reconciliation';

export async function reconcileDebtsAction(input: DebtReconciliationInput): Promise<{ success: boolean; data?: DebtReconciliationOutput, error?: string }> {
  try {
    const result = await reconcileDebts(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in reconcileDebtsAction:', error);
    return { success: false, error: 'Falha ao reconciliar dívidas com a IA.' };
  }
}
