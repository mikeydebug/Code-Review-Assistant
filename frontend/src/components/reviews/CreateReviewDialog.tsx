'use client';

import { useState } from 'react';
import { useCreateReview } from '@/hooks/useReviews';
import { useFileTree } from '@/hooks/useFiles';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BrainCircuit, Loader2 } from 'lucide-react';

export function CreateReviewDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY'>('CODE_QUALITY');
  const { data: fileData, isLoading: isLoadingFiles } = useFileTree(projectId);
  const { mutate: createReview, isPending } = useCreateReview();

  // For simplicity in this demo, we'll scan all files in the tree
  // A production app would let users select specific files using checkboxes in the tree.
  const getAllFileIds = (nodes: any[]): string[] => {
    let ids: string[] = [];
    for (const node of nodes) {
      if (node.type === 'file' && node.id) ids.push(node.id);
      if (node.children) ids = ids.concat(getAllFileIds(node.children));
    }
    return ids;
  };

  const fileIds = fileData ? getAllFileIds(fileData.tree) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileIds.length === 0) return;
    
    createReview(
      { projectId, type, fileIds },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-9">
          <BrainCircuit size={16} /> Run AI Review
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="text-indigo-400" /> Start AI Review
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Select the type of review. Our AI will analyze all {fileIds.length} uploaded files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Review Type</Label>
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger className="bg-slate-900 border-slate-800 focus:ring-indigo-500">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="CODE_QUALITY">Code Quality & Best Practices</SelectItem>
                <SelectItem value="SECURITY">Security Vulnerabilities</SelectItem>
                <SelectItem value="PERFORMANCE">Performance Optimization</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-800 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || fileIds.length === 0 || isLoadingFiles} 
              className="bg-indigo-600 hover:bg-indigo-700 w-[140px]"
            >
              {isPending ? <Loader2 className="animate-spin" size={16} /> : 'Start Analysis'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
