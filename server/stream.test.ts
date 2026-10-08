import { expect, it } from 'vitest';
import { readSSE, consumeProviderStream } from './stream';

it('decodes split UTF-8 SSE frames and the final frame', async () => {
  const bytes = new TextEncoder().encode('data: {"text":"한글"}\r\n\r\ndata: {"text":"끝"}');
  const stream = new ReadableStream<Uint8Array>({ start(c) {
    for (const byte of bytes) c.enqueue(new Uint8Array([byte]));
    c.close();
  } });
  const values = [];
  for await (const value of readSSE(stream)) values.push(value);
  expect(values).toEqual([{ text: '한글' }, { text: '끝' }]);
});

it('streams Anthropic text and requires a completion event', async () => {
  const deltas: string[] = [];
  const body = new Response('data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"code"}}\n\ndata: {"type":"message_stop"}\n\n').body!;
  expect(await consumeProviderStream(body, 'anthropic', text => deltas.push(text))).toBe('code');
  expect(deltas).toEqual(['code']);
  await expect(consumeProviderStream(new Response('').body!, 'anthropic', () => {})).rejects.toThrow('중단');
});

it('streams Google visible text and rejects truncated output', async () => {
  const body = new Response('data: {"candidates":[{"content":{"parts":[{"text":"secret","thought":true},{"text":"code"}]},"finishReason":"STOP"}]}\n\n').body!;
  expect(await consumeProviderStream(body, 'google', () => {})).toBe('code');
  const truncated = new Response('data: {"candidates":[{"finishReason":"MAX_TOKENS"}]}\n\n').body!;
  await expect(consumeProviderStream(truncated, 'google', () => {})).rejects.toThrow('잘렸');
});
