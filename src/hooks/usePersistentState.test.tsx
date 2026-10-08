import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { usePersistentState } from './usePersistentState';

describe('usePersistentState', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('저장된 값을 초기 상태로 복원하고 변경을 localStorage에 저장한다', () => {
    localStorage.setItem('provider', JSON.stringify('anthropic'));
    const { result } = renderHook(() => usePersistentState('provider', 'google'));

    expect(result.current[0]).toBe('anthropic');

    act(() => result.current[1]('google'));

    expect(localStorage.getItem('provider')).toBe(JSON.stringify('google'));
  });

  it('저장된 값이 유효하지 않으면 기본값을 사용한다', () => {
    localStorage.setItem('provider', '{invalid json');
    const { result } = renderHook(() => usePersistentState('provider', 'google'));

    expect(result.current[0]).toBe('google');
  });
});
