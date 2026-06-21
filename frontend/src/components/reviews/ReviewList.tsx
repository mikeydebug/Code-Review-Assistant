import { formatDistanceToNow } from 'date-fns';
import { Review } from '@/types/review';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, Loader2, ShieldAlert, Zap, Code2, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const TYPE_CONFIG = {
  SECURITY: { icon: ShieldAlert, color: 'text-red-400' },
  PERFORMANCE: { icon: Zap, color: 'text-yellow-400' },
  CODE_QUALITY: { icon: Code2, color: 'text-blue-400' },
};

const STATUS_CONFIG = {
  PENDING: { icon: Loader2, color: 'text-slate-400', label: 'Queued', spin: true },
  IN_PROGRESS: { icon: Loader2, color: 'text-indigo-400', label: 'Analyzing...', spin: true },
  COMPLETED: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Completed', spin: false },
  FAILED: { icon: AlertCircle, color: 'text-red-500', label: 'Failed', spin: false },
};

export function ReviewList({ reviews, projectId }: { reviews: Review[], projectId: string }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!reviews.length) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-lg">
        <BrainCircuit size={48} className="mx-auto text-slate-700 mb-4" />
        <h3 className="text-lg font-medium text-slate-300">No reviews yet</h3>
        <p className="text-slate-500 mt-1">Run an AI review to analyze your code.</p>
      </div>
    );
  }

  const filteredReviews = reviews.filter(review => {
    const q = searchQuery.toLowerCase();
    const typeMatch = review.type.toLowerCase().includes(q);
    const summaryMatch = review.summary?.toLowerCase().includes(q);
    const statusMatch = review.status.toLowerCase().includes(q);
    return typeMatch || summaryMatch || statusMatch;
  });

  return (
    <div className="space-y-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <Input 
          type="text" 
          placeholder="Search reviews by type, status, or summary..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#0f172a]/40 border-indigo-500/20 text-slate-200 placeholder:text-slate-500"
        />
      </div>
      
      {filteredReviews.length === 0 ? (
        <div className="py-8 text-center text-slate-500">No reviews match your search.</div>
      ) : (
        filteredReviews.map((review) => {
          const TypeIcon = TYPE_CONFIG[review.type].icon;
        const StatusIcon = STATUS_CONFIG[review.status].icon;
        
        return (
          <Link key={review.id} href={`/projects/${projectId}/reviews/${review.id}`}>
            <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors cursor-pointer mb-4 group">
              <CardHeader className="pb-3 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TypeIcon className={TYPE_CONFIG[review.type].color} size={20} />
                    {review.type.replace('_', ' ')} REVIEW
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    Started {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={`border-slate-700 flex items-center gap-1.5 ${STATUS_CONFIG[review.status].color}`}>
                  <StatusIcon size={14} className={STATUS_CONFIG[review.status].spin ? 'animate-spin' : ''} />
                  {STATUS_CONFIG[review.status].label}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="bg-slate-950 px-3 py-1.5 rounded-md text-sm border border-slate-800 text-slate-300">
                    <span className="text-slate-500 mr-2">Files Scanned:</span>
                    {review._count?.files || 0}
                  </div>
                  <div className="bg-slate-950 px-3 py-1.5 rounded-md text-sm border border-slate-800 text-slate-300">
                    <span className="text-slate-500 mr-2">Issues Found:</span>
                    <span className={review._count?.issues ? 'text-orange-400 font-medium' : 'text-emerald-400'}>
                      {review._count?.issues || 0}
                    </span>
                  </div>
                </div>
                
                {review.summary && review.status === 'COMPLETED' && (
                  <div className="text-sm text-slate-400 line-clamp-3 prose prose-invert max-w-none">
                    <ReactMarkdown>{review.summary}</ReactMarkdown>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
        })
      )}
    </div>
  );
}
