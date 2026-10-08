import { describe, expect, it } from 'vitest';
import { MAX_PROMPT_LENGTH, isPromptWithinLength } from './prompt';

describe('isPromptWithinLength', () => {
  it('500자 프롬프트를 허용한다', () => {
    expect(isPromptWithinLength('a'.repeat(MAX_PROMPT_LENGTH))).toBe(true);
  });

  it('500자를 초과한 프롬프트를 거부한다', () => {
    expect(isPromptWithinLength('a'.repeat(MAX_PROMPT_LENGTH + 1))).toBe(false);
  });
});
