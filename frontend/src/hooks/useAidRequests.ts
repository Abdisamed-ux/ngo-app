import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';
import type {
  AidRequest,
  CreateAidRequestPayload,
  PaginatedResponse,
  AidRequestStatus,
  UrgencyLevel,
} from '../types/index.js';

export const useAllAidRequests = (page = 1, status?: AidRequestStatus, urgency?: UrgencyLevel) => {
  return useQuery({
    queryKey: ['aid-requests', page, status, urgency],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 25 };
      if (status) params.status = status;
      if (urgency) params.urgency = urgency;
      const { data } = await api.get<PaginatedResponse<AidRequest>>('/aid-requests', { params });
      return data;
    },
  });
};

export const useSubmitAidRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAidRequestPayload) => {
      const { data } = await api.post('/aid-requests', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aid-requests'] });
    },
  });
};

export const useUpdateCaseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      urgency,
      reason,
    }: {
      requestId: string;
      status?: AidRequestStatus;
      urgency?: UrgencyLevel;
      reason?: string;
    }) => {
      const { data } = await api.patch(`/case-mgmt/${requestId}/status`, { status, urgency, reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aid-requests'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
    },
  });
};
