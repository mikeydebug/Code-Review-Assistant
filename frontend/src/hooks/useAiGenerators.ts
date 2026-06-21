import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export const useGenerateReadme = () => {
  return useMutation({
    mutationFn: async (projectId: string) => {
      const response = await api.post(`/ai/generate-readme/${projectId}`);
      return response.data.data as { markdown: string };
    },
    onMutate: () => {
      toast.loading('Analyzing project and writing README...', { id: 'readme-gen' });
    },
    onSuccess: () => {
      toast.success('README generated!', { id: 'readme-gen' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate README', { id: 'readme-gen' });
    },
  });
};

export const useGenerateTest = () => {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await api.post(`/ai/generate-test/${fileId}`);
      return response.data.data as { markdown: string };
    },
    onMutate: () => {
      toast.loading('Writing unit test... This may take 10-15 seconds.', { id: 'test-gen' });
    },
    onSuccess: () => {
      toast.success('Unit test generated!', { id: 'test-gen' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to generate test suite', { id: 'test-gen' });
    },
  });
};
