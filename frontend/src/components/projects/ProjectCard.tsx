'use client';

import { Project } from '@/types/project';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { FolderGit2, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Link href={`/projects/${project.id}/files`}>
        <Card className="glass-panel border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer group h-full relative">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-2 text-indigo-400">
              <FolderGit2 size={20} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative"
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating to project
                onDelete(project.id);
              }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          <CardTitle className="text-xl">{project.name}</CardTitle>
          <CardDescription>
            Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-400 flex justify-between items-center group-hover:text-indigo-300 transition-colors">
            <span>Explore Codebase</span>
            <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>
        </CardContent>
      </Card>
      </Link>
    </motion.div>
  );
}
