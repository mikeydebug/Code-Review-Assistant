'use client';

import { useDeleteProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface DeleteProjectDialogProps {
  projectId: string | null;
  onClose: () => void;
}

export function DeleteProjectDialog({ projectId, onClose }: DeleteProjectDialogProps) {
  const { mutate: deleteProject, isPending } = useDeleteProject();

  const handleConfirm = () => {
    if (!projectId) return;
    deleteProject(projectId, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={!!projectId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-slate-950 border-slate-800 text-slate-100">
        <DialogHeader>
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <div className="p-2 bg-red-500/10 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className="text-xl">Delete Project</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 pt-2">
            Are you sure you want to delete this project? This action cannot be undone. All associated files, AI reviews, and issues will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4 mt-2 border-t border-slate-800/50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-800 hover:bg-slate-800"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
