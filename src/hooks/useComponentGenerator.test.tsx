import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useComponentGenerator } from './useComponentGenerator';

afterEach(() => vi.unstubAllGlobals());

it('shows partial code before completion and saves only the final code', async () => {
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new ReadableStream({ start(c) { controller = c; } }))));
  const { result } = renderHook(() => useComponentGenerator());
  let pending!: Promise<void>;
  act(() => { pending = result.current.generate('카드', undefined, 'google'); });
  await waitFor(() => expect(result.current.isLoading).toBe(true));
  act(() => controller.enqueue(new TextEncoder().encode('data: {"type":"delta","text":"const Card"}\n\n')));
  await waitFor(() => expect(result.current.draft?.code).toBe('const Card'));
  expect(result.current.components).toHaveLength(0);
  await act(async () => {
    controller.enqueue(new TextEncoder().encode('data: {"type":"done","code":"render(<div />);"}\n\n'));
    controller.close();
    await pending;
  });
  expect(result.current.draft).toBeNull();
  expect(result.current.components[0].code).toBe('render(<div />);');
  vi.unstubAllGlobals();
});

it('discards incomplete generation and reports a connection error', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('data: {"type":"delta","text":"partial"}\n\n')));
  const { result } = renderHook(() => useComponentGenerator());
  await act(() => result.current.generate('카드', undefined, 'google'));
  expect(result.current.components).toEqual([]);
  expect(result.current.draft).toBeNull();
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toContain('중단');
});
