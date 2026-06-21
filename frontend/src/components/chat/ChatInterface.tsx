'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatSession, useSendMessage } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';


export function ChatInterface({ sessionId }: { sessionId: string | null }) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { data: session } = useChatSession(sessionId);
  const { mutate: sendMessage, isPending } = useSendMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, isPending]);

  if (!sessionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950">
        <Bot size={48} className="mb-4 opacity-50" />
        <p>Select or create a chat session to begin.</p>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    
    // Optimistic UI could be added here
    sendMessage({ sessionId, content: input }, {
      onSuccess: () => setInput('')
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-transparent">
      <div className="p-4 border-b border-indigo-500/20 font-medium text-slate-200 bg-[#0f172a]/20">
        {session?.title || 'Chat'}
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {session?.messages?.length === 0 && (
            <div className="text-center text-slate-500 mt-10">
              No messages yet. Send a message to start!
            </div>
          )}
          
          {session?.messages?.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ASSISTANT' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Bot size={18} className="text-emerald-500" />
                </div>
              )}
              <div className={`p-4 rounded-lg max-w-[85%] ${
                msg.role === 'USER' 
                  ? 'bg-indigo-600/20 text-indigo-100 border border-indigo-500/30' 
                  : 'bg-[#1e293b]/50 text-slate-200 border border-slate-700/50'
              }`}>
                <div className="prose prose-invert max-w-none text-sm prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.role === 'USER' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <User size={18} className="text-indigo-400" />
                </div>
              )}
            </div>
          ))}
          
          {isPending && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Loader2 size={18} className="text-emerald-500 animate-spin" />
              </div>
              <div className="p-4 rounded-lg bg-[#1e293b]/50 text-slate-200 border border-slate-700/50">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-[#0f172a]/40 border-t border-indigo-500/20 backdrop-blur-md">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code..."
            className="flex-1 bg-[#020617]/50 border-indigo-500/30 focus-visible:ring-indigo-500"
            disabled={isPending}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isPending}
            className="bg-indigo-600 hover:bg-indigo-700 w-12 px-0"
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
