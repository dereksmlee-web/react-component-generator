import { afterEach, expect, it, vi } from 'vitest';
import { readSSE } from './stream';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it('resets partial Google output on fallback and sends normalized final code', async () => {
  let handle!: (req: Request) => Promise<Response>;
  vi.stubGlobal('Bun', { serve: (options: { fetch: typeof handle }) => { handle = options.fetch; return { port: 3002 }; } });
  const providerFetch = vi.fn()
    .mockResolvedValueOnce(new Response('data: {"candidates":[{"content":{"parts":[{"text":"discard me"}]} }]}\n\n'))
    .mockResolvedValueOnce(new Response('data: {"candidates":[{"content":{"parts":[{"text":"const Card = () => <div />;"}]},"finishReason":"STOP"}]}\n\n'));
  vi.stubGlobal('fetch', providerFetch);
  await import('./index');
  const response = await handle(new Request('http://localhost/api/generate', { method: 'POST', body: JSON.stringify({ prompt: 'card', provider: 'google', apiKey: 'test-key' }) }));
  const events = [];
  for await (const event of readSSE(response.body!)) events.push(event);
  expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  expect(events).toEqual([
    { type: 'reset' }, { type: 'delta', text: 'discard me' },
    { type: 'reset' }, { type: 'delta', text: 'const Card = () => <div />;' },
    { type: 'done', code: 'const Card = () => <div />;\n\nrender(<Card />);' },
  ]);
  expect(providerFetch.mock.calls[0][0]).toContain('gemini-3.1-flash-lite:streamGenerateContent');
  expect(providerFetch.mock.calls[1][0]).toContain('gemini-3.5-flash:streamGenerateContent');
});
