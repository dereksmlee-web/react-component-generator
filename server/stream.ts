import { readSSE } from '../src/utils/stream';
export { readSSE };

export async function consumeProviderStream(
  body: ReadableStream<Uint8Array>, provider: 'google' | 'anthropic', onText: (text: string) => void,
): Promise<string> {
  type Event = {
    type?: string; error?: { message?: string; status?: string; type?: string };
    delta?: { type?: string; text?: string; stop_reason?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> }; finishReason?: string }>;
  };
  let text = '';
  let complete = false;
  for await (const event of readSSE<Event>(body)) {
    if (event.error) throw new Error(`Provider stream error: ${event.error.status || event.error.type || 'unknown'}`);
    let delta = '';
    if (provider === 'anthropic') {
      if (event.delta?.stop_reason === 'max_tokens') throw new Error('생성된 코드가 너무 길어 잘렸습니다. 더 간단한 컴포넌트를 요청해주세요.');
      if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') delta = event.delta.text || '';
      if (event.type === 'message_stop') complete = true;
    } else {
      const candidate = event.candidates?.[0];
      if (candidate?.finishReason === 'MAX_TOKENS') throw new Error('생성된 코드가 너무 길어 잘렸습니다. 더 간단한 컴포넌트를 요청해주세요.');
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') throw new Error('코드 생성을 완료하지 못했습니다. 다른 요청으로 다시 시도해주세요.');
      delta = candidate?.content?.parts?.filter(part => !part.thought).map(part => part.text || '').join('') || '';
      if (candidate?.finishReason === 'STOP') complete = true;
    }
    if (delta) { text += delta; onText(delta); }
  }
  if (!complete || !text.trim()) throw new Error('코드 생성 연결이 중단되었습니다. 다시 시도해주세요.');
  return text;
}
