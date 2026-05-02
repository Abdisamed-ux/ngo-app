import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore.js';
import api from '../lib/api.js';
import type {
  AidRequest,
  CreateAidRequestPayload,
  PaginatedResponse,
  AidRequestStatus,
  UrgencyLevel,
  CaseDocument,
} from '../types/index.js';

export const useAllAidRequests = (page = 1, status?: AidRequestStatus, urgency?: UrgencyLevel) => {
  const { user } = useAuthStore.getState();
  const isBeneficiary = user?.role === 'BENEFICIARY';

  return useQuery({
    queryKey: ['aid-requests', page, status, urgency, isBeneficiary],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 25 };
      if (status) params.status = status;
      if (urgency) params.urgency = urgency;
      
      const endpoint = isBeneficiary ? '/aid-requests/my' : '/aid-requests';
      const { data } = await api.get<PaginatedResponse<AidRequest>>(endpoint, { params });
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

export const useAidTypes = () => {
  return useQuery({
    queryKey: ['aid-types'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Array<{ id: string; name: string }> }>('/aid-requests/types');
      return data.data;
    },
  });
};

export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Array<{ id: string; name: string }> }>('/aid-requests/regions');
      return data.data;
    },
  });
};

export const useCaseDocuments = (requestId: string | null) => {
  return useQuery({
    queryKey: ['case-documents', requestId],
    queryFn: async () => {
      const { data } = await api.get<{ data: CaseDocument[] }>(`/case-mgmt/${requestId}/documents`);
      return data.data;
    },
    enabled: !!requestId,
  });
};

export const useUploadCaseDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, file }: { requestId: string; file: File }) => {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await api.post(`/case-mgmt/${requestId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['case-documents', variables.requestId] });
    },
  });
};
