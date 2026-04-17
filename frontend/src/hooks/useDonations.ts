import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';
import type { Donation, CreateDonationPayload, PaginatedResponse } from '../types/index.js';

export const useAllDonations = (page = 1, status?: string) => {
  return useQuery({
    queryKey: ['donations', page, status],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 25 };
      if (status) params.status = status;
      const { data } = await api.get<PaginatedResponse<Donation>>('/donations', { params });
      return data;
    },
  });
};

export const useCreateDonation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateDonationPayload) => {
      const { data } = await api.post('/donations', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};
