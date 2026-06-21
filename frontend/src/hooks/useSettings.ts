import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export interface AiProvider {
  id: string;
  name: string;
  baseUrl: string;
  modelName: string;
  isDefault: boolean;
  createdAt: string;
}

export function useAiProviders() {
  return useQuery<AiProvider[]>({
    queryKey: ['ai-providers'],
    queryFn: async () => {
      const { data } = await api.get('/settings/ai-providers');
      return data.data;
    },
  });
}

export function useAddAiProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; baseUrl: string; apiKey: string; modelName: string; isDefault: boolean }) => {
      const { data } = await api.post('/settings/ai-providers', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
      toast.success('AI Provider added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add AI Provider');
    },
  });
}

export function useRemoveAiProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/settings/ai-providers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-providers'] });
      toast.success('AI Provider removed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove AI Provider');
    },
  });
}
