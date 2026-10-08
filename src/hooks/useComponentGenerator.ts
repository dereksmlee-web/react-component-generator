import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { usePersistentState } from './usePersistentState';

export const COMPONENTS_STORAGE_KEY = 'react-component-generator.components';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = usePersistentState<GeneratedComponent[]>(
    COMPONENTS_STORAGE_KEY,
    [],
    parseStoredComponents,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate component');
      }

      const newComponent: GeneratedComponent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prompt,
        code: data.code,
        createdAt: new Date(),
      };

      setComponents((prev) => [newComponent, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [setComponents]);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, [setComponents]);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, [setComponents]);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}

function parseStoredComponents(value: unknown): GeneratedComponent[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const components = value.map(parseStoredComponent);
  return components.every((component): component is GeneratedComponent => component !== null)
    ? components
    : null;
}

function parseStoredComponent(value: unknown): GeneratedComponent | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const { id, prompt, code, createdAt } = value as Record<string, unknown>;
  const restoredCreatedAt = new Date(typeof createdAt === 'string' ? createdAt : '');
  if (
    typeof id !== 'string'
    || typeof prompt !== 'string'
    || typeof code !== 'string'
    || Number.isNaN(restoredCreatedAt.getTime())
  ) {
    return null;
  }

  return { id, prompt, code, createdAt: restoredCreatedAt };
}
