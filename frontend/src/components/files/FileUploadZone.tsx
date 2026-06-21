'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUploadZip, useUploadFiles, useUploadGithub } from '@/hooks/useFiles';
import { FileArchive, FileCode2, FolderGit2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function FileUploadZone({ projectId }: { projectId: string }) {
  const { mutate: uploadZip, isPending: isUploadingZip } = useUploadZip(projectId);
  const { mutate: uploadFiles, isPending: isUploadingFiles } = useUploadFiles(projectId);
  const { mutate: uploadGithub, isPending: isUploadingGithub } = useUploadGithub(projectId);
  const [githubUrl, setGithubUrl] = useState('');

  const isPending = isUploadingZip || isUploadingFiles || isUploadingGithub;

  const handleGithubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubUrl.trim()) {
      uploadGithub(githubUrl.trim(), {
        onSuccess: () => setGithubUrl('')
      });
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const zipFile = acceptedFiles.find((f) => f.name.endsWith('.zip'));
      if (zipFile) {
        uploadZip(zipFile);
      } else {
        uploadFiles(acceptedFiles);
      }
    },
    [uploadZip, uploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
        } ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="flex -space-x-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center z-10 border-2 border-slate-950">
              <FileArchive size={18} className="text-orange-400" />
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-950">
              <FileCode2 size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-200">
            {isPending ? 'Processing...' : 'Drag & drop files or ZIP'}
          </p>
          <p className="text-xs text-slate-500">
            or click to browse
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900/50 px-2 text-slate-500">Or import from</span>
        </div>
      </div>

      <form onSubmit={handleGithubSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <FolderGit2 className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className="pl-9 bg-slate-950 border-slate-800 h-9 text-sm focus-visible:ring-indigo-500"
            disabled={isPending}
          />
        </div>
        <Button 
          type="submit" 
          disabled={!githubUrl || isPending} 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
        >
          {isUploadingGithub ? <Loader2 size={16} className="animate-spin" /> : 'Import'}
        </Button>
      </form>
    </div>
  );
}
