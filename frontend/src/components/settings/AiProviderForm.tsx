'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAddAiProvider } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PRESETS = [
  { id: 'groq', name: 'Groq Cloud', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.1-70b-versatile' },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', model: 'anthropic/claude-3-haiku' },
  { id: 'lmstudio', name: 'LM Studio (Local)', baseUrl: 'http://localhost:1234/v1', model: 'local-model' },
];

export function AiProviderForm() {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const { mutate: createProvider, isPending } = useAddAiProvider();

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      name: '',
      baseUrl: '',
      apiKey: '',
      modelName: '',
    }
  });

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setValue('name', preset.name);
      setValue('baseUrl', preset.baseUrl);
      setValue('modelName', preset.model);
    }
  };

  const onSubmit = (data: any) => {
    createProvider(data, {
      onSuccess: () => {
        reset();
        setSelectedPreset('');
      }
    });
  };

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader>
        <CardTitle>Add AI Provider</CardTitle>
        <CardDescription className="text-slate-400">
          Configure an LLM provider for code reviews and chat.
        </CardDescription>
        
        <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-sm text-indigo-200">
          <strong>Note:</strong> If you do not configure an API provider here, the system will automatically fall back to the default OpenRouter API configured in the backend environment.
        </div>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="bg-slate-950 border-slate-800">
                <SelectValue placeholder="Select a preset..." />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>{preset.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider Name</Label>
              <Input {...register('name', { required: true })} placeholder="e.g. Groq" className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input {...register('modelName', { required: true })} placeholder="e.g. llama-3.1-70b-versatile" className="bg-white/5 border-white/10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input {...register('baseUrl', { required: true })} placeholder="https://api.openai.com/v1" className="bg-white/5 border-white/10" />
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <Input {...register('apiKey')} type="password" placeholder="sk-..." className="bg-white/5 border-white/10" />
            <p className="text-xs text-slate-500">Leave empty if using a local provider that doesn't require auth.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isPending} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
