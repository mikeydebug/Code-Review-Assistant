export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  id?: string;           // only for files
  language?: string;     // only for files
  size?: number;         // only for files
  children?: FileNode[]; // only for directories
}

export interface FileContent {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
}

export interface FileTreeResponse {
  tree: FileNode[];
  totalFiles: number;
  totalSize: number;
}
