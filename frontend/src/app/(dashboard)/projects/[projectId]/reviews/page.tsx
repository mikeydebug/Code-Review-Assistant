'use client';

import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useProject } from '@/hooks/useProjects';
import { useReviews } from '@/hooks/useReviews';
import { ReviewList } from '@/components/reviews/ReviewList';
import { CreateReviewDialog } from '@/components/reviews/CreateReviewDialog';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export default function ReviewsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: reviews, isLoading } = useReviews(projectId);

  const header = (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/projects" className="hover:text-slate-100 flex items-center gap-1">
          <ArrowLeft size={16} /> My Projects
        </Link>
        <ChevronRight size={16} />
        <span className="text-slate-100 font-medium">{project?.name || 'Loading...'}</span>
        <ChevronRight size={16} />
        <span className="text-slate-100 font-medium">AI Reviews</span>
      </div>
      <CreateReviewDialog projectId={projectId} />
    </div>
  );

  return (
    <DashboardShell header={header}>
      <div className="max-w-4xl mx-auto mt-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl bg-slate-800" />
            ))}
          </div>
        ) : (
          <ReviewList reviews={reviews || []} projectId={projectId} />
        )}
      </div>
    </DashboardShell>
  );
}
