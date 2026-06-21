'use client';

import { useUiStore } from '@/store/uiStore';
import { useFileContent } from '@/hooks/useFiles';
import Editor from '@monaco-editor/react';
import { Loader2, Beaker, FileCode2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGenerateTest } from '@/hooks/useAiGenerators';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ReactMarkdown from 'react-markdown';

export function FilePreview({ projectId }: { projectId: string }) {
  const { selectedFileId } = useUiStore();
  const { data: file, isLoading } = useFileContent(projectId, selectedFileId);
  const { mutate: generateTest, isPending: isGeneratingTest } = useGenerateTest();
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleGenerateTest = () => {
    if (!selectedFileId) return;
    generateTest(selectedFileId, {
      onSuccess: (data) => setTestResult(data.markdown),
    });
  };

  if (!selectedFileId) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 bg-slate-950">
        Select a file from the explorer to preview
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-red-400 bg-slate-950">
        Failed to load file content
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="text-sm text-slate-400 font-mono flex items-center gap-2">
          <FileCode2 size={16} />
          {file.path}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="h-8 border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
          onClick={handleGenerateTest}
          disabled={isGeneratingTest || ['plaintext', 'markdown', 'json'].includes(file.language)}
        >
          {isGeneratingTest ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Beaker size={14} className="mr-2" />}
          Generate Unit Test
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={file.language === 'plaintext' ? undefined : file.language}
          theme="vs-dark"
          value={file.content}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: 'on',
          }}
        />
      </div>

      <Dialog open={testResult !== null} onOpenChange={(open) => { if (!open) setTestResult(null) }}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col bg-slate-950 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Beaker className="text-emerald-400" /> Generated Unit Test
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              AI has generated this test suite for {file.name}. Review and copy it to your test directory.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto mt-4 border border-slate-800 rounded-md p-4 bg-slate-900/50">
            <div className="prose prose-invert max-w-none prose-sm prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:overflow-x-auto">
              {testResult ? (
                <ReactMarkdown>{testResult}</ReactMarkdown>
              ) : (
                <div className="text-slate-400 italic">
                  The AI could not generate a test suite for this file. Please ensure it is a valid code file containing testable logic.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
