'use client';

import { useState } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { DeleteProjectDialog } from '@/components/projects/DeleteProjectDialog';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { FolderGit2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const header = (
    <div className="flex justify-between items-center w-full">
      <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
      <CreateProjectDialog />
    </div>
  );

  return (
    <DashboardShell header={header}>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[125px] w-full rounded-xl bg-slate-800" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px] bg-slate-800" />
                <Skeleton className="h-4 w-[200px] bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : projects?.length === 0 ? (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
            <FolderGit2 size={40} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No projects found</h2>
          <p className="text-slate-400 mb-8">
            Create your first project to upload codebase files and run AI-powered code reviews.
          </p>
          <CreateProjectDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={setProjectToDelete}
            />
          ))}
        </div>
      )}

      <DeleteProjectDialog
        projectId={projectToDelete}
        onClose={() => setProjectToDelete(null)}
      />
    </DashboardShell>
  );
}
