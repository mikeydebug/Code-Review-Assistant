'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useChatSessions, useCreateChatSession } from '@/hooks/useChat';
import { useProject } from '@/hooks/useProjects';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquarePlus, MessageSquare, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: sessions, isLoading } = useChatSessions(projectId);
  const { mutate: createSession, isPending } = useCreateChatSession();
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Auto-select first session if none selected
  if (!activeSessionId && sessions && sessions.length > 0) {
    setActiveSessionId(sessions[0].id);
  }

  const handleNewChat = () => {
    createSession({ projectId, title: 'New Chat' }, {
      onSuccess: (newSession) => {
        setActiveSessionId(newSession.id);
      }
    });
  };

  const header = (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <Link href="/projects" className="hover:text-slate-100 flex items-center gap-1">
        <ArrowLeft size={16} /> My Projects
      </Link>
      <ChevronRight size={16} />
      <span className="text-slate-100 font-medium">{project?.name || 'Loading...'}</span>
      <ChevronRight size={16} />
      <span className="text-slate-100 font-medium">AI Chat Assistant</span>
    </div>
  );

  return (
    <DashboardShell header={header} scrollable={false}>
      <div className="flex flex-1 min-h-0 border border-indigo-500/20 rounded-lg overflow-hidden bg-[#020617]/40 shadow-2xl backdrop-blur-md">
        <div className="w-64 border-r border-indigo-500/20 flex flex-col bg-[#0f172a]/40">
          <div className="p-4 border-b border-indigo-500/20">
            <Button 
              onClick={handleNewChat} 
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <MessageSquarePlus size={16} /> New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="text-center text-sm text-slate-500 py-4">Loading...</div>
              ) : sessions?.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-4">No chat history</div>
              ) : (
                sessions?.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={cn(
                      "w-full text-left px-3 py-3 rounded-md text-sm flex flex-col gap-1 transition-colors",
                      activeSessionId === session.id 
                        ? "bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-500" 
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <MessageSquare size={14} className="shrink-0" />
                      <span className="truncate">{session.title}</span>
                    </div>
                    <div className="text-xs text-slate-500 pl-6">
                      {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <ChatInterface sessionId={activeSessionId} />
        </div>
      </div>
    </DashboardShell>
  );
}
