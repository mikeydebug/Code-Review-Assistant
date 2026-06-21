import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ChatSession, Message } from '@/types/chat';

export function useChatSessions(projectId: string) {
  return useQuery<ChatSession[]>({
    queryKey: ['chat-sessions', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/project/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,
  });
}

export function useChatSession(sessionId: string | null) {
  return useQuery<ChatSession>({
    queryKey: ['chat-session', sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/chat/session/${sessionId}`);
      return data.data;
    },
    enabled: !!sessionId,
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, title }: { projectId: string; title: string }) => {
      const { data } = await api.post(`/chat/project/${projectId}`, { title });
      return data.data as ChatSession;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions', variables.projectId] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      const { data } = await api.post(`/chat/session/${sessionId}/message`, { content });
      return data.data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chat-session', variables.sessionId] });
    },
  });
}
