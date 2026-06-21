import { Issue } from '@/types/review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, FileCode2, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SEVERITY_CONFIG = {
  CRITICAL: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: ShieldAlert },
  HIGH: { color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: AlertTriangle },
  MEDIUM: { color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: AlertCircle },
  LOW: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Info },
};

export function IssueCard({ issue }: { issue: Issue }) {
  const config = SEVERITY_CONFIG[issue.severity];
  const Icon = config.icon;

  return (
    <Card className="bg-slate-900 border-slate-800 mb-4 overflow-hidden">
      <CardHeader className="bg-slate-900/50 pb-3 border-b border-slate-800">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-base font-medium flex-1 text-slate-200">
            {issue.title}
          </CardTitle>
          <Badge className={`flex items-center gap-1.5 shrink-0 border ${config.color}`} variant="outline">
            <Icon size={14} />
            {issue.severity}
          </Badge>
        </div>
        {(issue.fileName || issue.lineNumber) && (
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-2 font-mono">
            <FileCode2 size={14} />
            {issue.fileName}
            {issue.lineNumber && <span className="text-slate-600">:{issue.lineNumber}</span>}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Description</h4>
          <div className="text-sm text-slate-300 prose prose-invert max-w-none">
            <ReactMarkdown>{issue.description}</ReactMarkdown>
          </div>
        </div>
        
        {issue.recommendation && (
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-md p-3">
            <h4 className="text-xs font-semibold uppercase text-indigo-400 mb-2">Recommendation</h4>
            <div className="text-sm text-slate-300 prose prose-invert max-w-none prose-p:leading-relaxed">
              <ReactMarkdown>{issue.recommendation}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
