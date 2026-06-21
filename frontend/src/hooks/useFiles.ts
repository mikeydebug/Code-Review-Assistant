import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FileTreeResponse, FileContent } from '@/types/file';
import toast from 'react-hot-toast';

export function useFileTree(projectId: string) {
  return useQuery<FileTreeResponse>({
    queryKey: ['files', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/files`);
      return data.data;
    },
    enabled: !!projectId,
  });
}

export function useFileContent(projectId: string, fileId: string | null) {
  return useQuery<FileContent>({
    queryKey: ['file', projectId, fileId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/files/${fileId}`);
      return data.data;
    },
    enabled: !!projectId && !!fileId,
  });
}

export function useUploadZip(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(`/projects/${projectId}/files/zip`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toast.success('ZIP uploaded and extracted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload ZIP');
    },
  });
}

export function useUploadFiles(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((f) => formData.append('files', f));
      const { data } = await api.post(`/projects/${projectId}/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toast.success('Files uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload files');
    },
  });
}

export function useUploadGithub(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      const { data } = await api.post(`/projects/${projectId}/files/github`, { url });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      toast.success('GitHub repository processed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clone GitHub repository');
    },
  });
}
