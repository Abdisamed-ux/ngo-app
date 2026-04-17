import { useQuery } from '@tanstack/react-query';
import api from '../lib/api.js';
import type { DashboardKPIs } from '../types/index.js';

export const useDashboardKPIs = () => {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardKPIs }>('/reporting/dashboard');
      return data.data;
    },
    refetchInterval: 60_000, // auto-refresh every minute
  });
};
