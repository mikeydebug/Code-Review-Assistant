'use client';

import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFileTree } from '@/hooks/useFiles';
import { useProject } from '@/hooks/useProjects';
import { FileTree } from '@/components/files/FileTree';
import { FilePreview } from '@/components/files/FilePreview';
import { FileUploadZone } from '@/components/files/FileUploadZone';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, ArrowLeft, BrainCircuit, MessageSquare, FileText, Loader2 } from 'lucide-react';
import { useGenerateReadme } from '@/hooks/useAiGenerators';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';

export default function ProjectFilesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: fileData, isLoading } = useFileTree(projectId);
  const { mutate: generateReadme, isPending: isGeneratingReadme } = useGenerateReadme();
  const [readmeResult, setReadmeResult] = useState<string | null>(null);

  const handleGenerateReadme = () => {
    generateReadme(projectId, {
      onSuccess: (data) => setReadmeResult(data.markdown),
    });
  };

  const header = (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link href="/projects" className="hover:text-slate-100 flex items-center gap-1">
          <ArrowLeft size={16} /> My Projects
        </Link>
        <ChevronRight size={16} />
        <span className="text-slate-100 font-medium">{project?.name || 'Loading...'}</span>
        <ChevronRight size={16} />
        <span className="text-slate-100 font-medium">Code Explorer</span>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
          onClick={handleGenerateReadme}
          disabled={isGeneratingReadme}
        >
          {isGeneratingReadme ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileText size={16} className="mr-2" />}
          Gen README
        </Button>
        <Link href={`/projects/${projectId}/reviews`}>
          <Button variant="outline" className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10">
            <BrainCircuit size={16} className="mr-2" />
            AI Reviews
          </Button>
        </Link>
        <Link href={`/projects/${projectId}/chat`}>
          <Button variant="outline" className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10">
            <MessageSquare size={16} className="mr-2" />
            Chat Assistant
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <DashboardShell header={header}>
      <div className="flex h-full border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
        <div className="w-72 border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-4 border-b border-slate-800">
            <FileUploadZone projectId={projectId} />
          </div>
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-800" />
                <Skeleton className="h-4 w-1/2 bg-slate-800" />
                <Skeleton className="h-4 w-5/6 bg-slate-800" />
              </div>
            ) : (
              <FileTree nodes={fileData?.tree || []} />
            )}
          </ScrollArea>
        </div>
        <div className="flex-1">
          <FilePreview projectId={projectId} />
        </div>
      </div>

      <Dialog open={readmeResult !== null} onOpenChange={(open) => { if (!open) setReadmeResult(null) }}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="text-blue-400" /> Generated Project README
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              AI has generated this documentation based on your project files. You can copy this to your repository.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto mt-4 border border-slate-800 rounded-md p-4 bg-slate-900/50">
            <div className="prose prose-invert max-w-none prose-sm prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:overflow-x-auto">
              <ReactMarkdown>{readmeResult || ''}</ReactMarkdown>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
