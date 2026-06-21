import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Review, CreateReviewPayload } from '@/types/review';
import toast from 'react-hot-toast';

export function useReviews(projectId: string) {
  return useQuery<Review[]>({
    queryKey: ['reviews', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/project/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,
    refetchInterval: (query) => {
      // Poll every 5s if any review is pending or in progress
      const hasActive = query.state.data?.some(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
      return hasActive ? 5000 : false;
    },
  });
}

export function useReview(reviewId: string) {
  return useQuery<Review>({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews/${reviewId}`);
      return data.data;
    },
    enabled: !!reviewId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateReviewPayload) => {
      const { data } = await api.post('/reviews', payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.projectId] });
      toast.success('AI Review started successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to start AI review');
    },
  });
}
