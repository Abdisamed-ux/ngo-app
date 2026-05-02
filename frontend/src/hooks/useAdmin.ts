import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';
import type { User, PaginatedResponse } from '../types/index.js';

export const useAllUsers = (page = 1) => {
  return useQuery({
    queryKey: ['admin-users', page],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<User>>(`/reporting/users?page=${page}`);
      return data;
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data } = await api.patch(`/reporting/users/${userId}/status`, { isActive });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
};

export const useAuditLogs = (page = 1) => {
  return useQuery({
    queryKey: ['audit-logs', page],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<any>>(`/reporting/audit-logs?page=${page}`);
      return data;
    },
  });
};
