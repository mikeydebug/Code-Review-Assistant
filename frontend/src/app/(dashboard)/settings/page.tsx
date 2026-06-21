'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { AiProviderForm } from '@/components/settings/AiProviderForm';
import { useAiProviders, useRemoveAiProvider } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, KeyRound } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function SettingsPage() {
  const { data: providers, isLoading } = useAiProviders();
  const { mutate: removeProvider } = useRemoveAiProvider();

  const header = (
    <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
  );

  return (
    <DashboardShell header={header}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium">AI Providers</h2>
            <p className="text-sm text-slate-400">Configure language models used for code reviews.</p>
          </div>
          <AiProviderForm />
        </div>
        
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-medium">Configured Providers</h2>
            <p className="text-sm text-slate-400">Your saved API keys and models.</p>
          </div>

          {isLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-24 bg-slate-800 rounded"></div>
                <div className="h-24 bg-slate-800 rounded"></div>
              </div>
            </div>
          ) : providers?.length === 0 ? (
            <div className="text-center p-8 border border-dashed border-white/20 rounded-xl glass-panel">
              <KeyRound size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-400">No providers configured.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {providers?.map((provider) => (
                <Card key={provider.id} className="glass-panel relative group overflow-hidden border-white/10">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 hidden group-hover:block transition-all"></div>
                  {provider.isDefault && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {provider.name}
                          {provider.isDefault && (
                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10">Default</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs mt-1 text-slate-500">{provider.baseUrl}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
                        onClick={() => removeProvider(provider.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Model: <span className="font-medium text-slate-200">{provider.modelName}</span></span>
                      <span className="text-slate-500 text-xs">Added {formatDistanceToNow(new Date(provider.createdAt))} ago</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
