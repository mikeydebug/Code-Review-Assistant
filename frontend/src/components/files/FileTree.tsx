'use client';
import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';
import { FileNode } from '@/types/file';
import { cn } from '@/lib/utils';

const LANGUAGE_COLORS: Record<string, string> = {
  typescript: 'text-blue-400',
  javascript: 'text-yellow-400',
  python: 'text-green-400',
  rust: 'text-orange-400',
  go: 'text-cyan-400',
  json: 'text-yellow-200',
  css: 'text-blue-300',
  html: 'text-orange-500',
};

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const { selectedFileId, setSelectedFileId } = useUiStore();

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 w-full hover:bg-slate-800 rounded px-2 py-1 text-sm text-slate-300 hover:text-slate-100 transition-colors"
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          {isOpen ? (
            <FolderOpen size={14} className="text-yellow-400 shrink-0" />
          ) : (
            <Folder size={14} className="text-yellow-400 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && node.children?.map((child) => (
          <FileTreeNode key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const isSelected = selectedFileId === node.id;
  return (
    <button
      onClick={() => setSelectedFileId(node.id!)}
      className={cn(
        'flex items-center gap-1.5 w-full rounded px-2 py-1 text-sm transition-colors',
        isSelected
          ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500'
          : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200',
      )}
      style={{ paddingLeft: `${depth * 14 + 22}px` }}
    >
      <File size={13} className={cn('shrink-0', LANGUAGE_COLORS[node.language || ''] || 'text-slate-500')} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileTree({ nodes }: { nodes: FileNode[] }) {
  if (!nodes.length) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        No files uploaded yet
      </div>
    );
  }
  return (
    <div className="py-2">
      {nodes.map((node) => (
        <FileTreeNode key={node.path} node={node} />
      ))}
    </div>
  );
}
