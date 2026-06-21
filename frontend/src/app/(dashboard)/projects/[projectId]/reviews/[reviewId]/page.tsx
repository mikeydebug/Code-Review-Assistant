'use client';

import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useReview } from '@/hooks/useReviews';
import { IssueCard } from '@/components/reviews/IssueCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ReviewDetailPage() {
  const { projectId, reviewId } = useParams<{ projectId: string; reviewId: string }>();
  const { data: review, isLoading } = useReview(reviewId);

  const header = (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Link href={`/projects/${projectId}/reviews`} className="hover:text-slate-100 flex items-center gap-1">
        <ArrowLeft size={16} /> Back to Reviews
      </Link>
      <ChevronRight size={16} />
      <span className="text-slate-100 font-medium">{review?.type.replace('_', ' ') || 'Review'} Details</span>
    </div>
  );

  if (isLoading) {
    return (
      <DashboardShell header={header}>
        <div className="max-w-4xl mx-auto mt-4 space-y-6">
          <Skeleton className="h-32 w-full rounded-xl bg-slate-800" />
          <Skeleton className="h-64 w-full rounded-xl bg-slate-800" />
        </div>
      </DashboardShell>
    );
  }

  if (!review) {
    return (
      <DashboardShell header={header}>
        <div className="flex items-center justify-center h-64 text-slate-400">
          Review not found
        </div>
      </DashboardShell>
    );
  }

  const isPending = review.status === 'PENDING' || review.status === 'IN_PROGRESS';

  return (
    <DashboardShell header={header}>
      <div className="max-w-4xl mx-auto mt-4 pb-12">
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-2">{review.type.replace('_', ' ')} Review</h1>
              <p className="text-slate-400 text-sm">
                Scanned {review.files?.length || 0} files • Found {review.issues?.length || 0} issues
              </p>
            </div>
            <Badge className={
              review.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              isPending ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
              'bg-red-500/10 text-red-500 border-red-500/20'
            } variant="outline">
              {isPending && <Loader2 size={12} className="animate-spin mr-1.5" />}
              {review.status}
            </Badge>
          </div>

          {isPending && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
              <p className="text-slate-300">AI is analyzing your code...</p>
              <p className="text-sm text-slate-500 mt-1">This might take a few moments depending on the file size.</p>
            </div>
          )}

          {review.summary && review.status === 'COMPLETED' && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <h3 className="text-sm font-semibold uppercase text-slate-500 mb-4">Executive Summary</h3>
              <div className="prose prose-invert max-w-none text-slate-300">
                <ReactMarkdown>{review.summary}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {review.issues && review.issues.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-slate-200">Discovered Issues</h2>
            <div className="space-y-4">
              {review.issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
