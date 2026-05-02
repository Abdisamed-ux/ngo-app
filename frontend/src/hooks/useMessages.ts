import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api.js';
import type { Message } from '../types/index.js';

export const useInbox = () => {
  return useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: async () => {
      const res = await api.get<{ data: Message[] }>('/messages/inbox');
      return res.data.data;
    },
  });
};

export const useSentMessages = () => {
  return useQuery({
    queryKey: ['messages', 'sent'],
    queryFn: async () => {
      const res = await api.get<{ data: Message[] }>('/messages/sent');
      return res.data.data;
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { receiverId: string; subject: string; body: string }) => {
      const res = await api.post('/messages/send', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'sent'] });
    },
  });
};

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/messages/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
    },
  });
};
