import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';

export interface DisbursePayload {
  requestId: string;
  amount: number;
  paymentReference: string;
  notes?: string;
}

export const useDisburseFunds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, ...payload }: DisbursePayload) => {
      const { data } = await api.post(`/funds/disburse/${requestId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aid-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
};
