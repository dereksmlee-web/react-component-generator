import { useState, useCallback } from 'react';
import { readSSE } from '../utils/stream';
import type { GeneratedComponent, Provider } from '../types';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  draft: GeneratedComponent | null;
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [draft, setDraft] = useState<GeneratedComponent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    const newComponent: GeneratedComponent = {
      id: crypto.randomUUID(), prompt, code: '', createdAt: new Date(),
    };
    setDraft(newComponent);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate component');
      }
      if (!res.body) throw new Error('생성 응답을 읽을 수 없습니다.');
      type Event = { type: 'delta' | 'reset' | 'done' | 'error'; text?: string; code?: string; error?: string };
      let completed = false;
      for await (const event of readSSE<Event>(res.body)) {
        if (event.type === 'error') throw new Error(event.error || '생성에 실패했습니다.');
        if (event.type === 'reset') newComponent.code = '';
        if (event.type === 'delta') newComponent.code += event.text || '';
        if (event.type === 'done') {
          newComponent.code = event.code || '';
          completed = true;
          break;
        }
        setDraft({ ...newComponent });
      }
      if (!completed) throw new Error('코드 생성 연결이 중단되었습니다. 다시 시도해주세요.');

      setComponents((prev) => [newComponent, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setDraft(null);
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { draft, components, isLoading, error, generate, removeComponent, clearAll };
}
