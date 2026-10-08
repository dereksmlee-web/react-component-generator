import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { COMPONENTS_STORAGE_KEY, useComponentGenerator } from './useComponentGenerator';

describe('useComponentGenerator', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('저장된 컴포넌트 목록과 생성 시각을 복원한다', () => {
    localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify([
      {
        id: 'saved-component',
        prompt: '프로필 카드',
        code: 'render(<div />);',
        createdAt: '2026-10-08T00:00:00.000Z',
      },
    ]));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].createdAt).toEqual(new Date('2026-10-08T00:00:00.000Z'));
  });

  it('전체 삭제 결과를 localStorage에 반영한다', () => {
    localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify([
      {
        id: 'saved-component',
        prompt: '프로필 카드',
        code: 'render(<div />);',
        createdAt: '2026-10-08T00:00:00.000Z',
      },
    ]));
    const { result } = renderHook(() => useComponentGenerator());

    act(() => result.current.clearAll());

    expect(localStorage.getItem(COMPONENTS_STORAGE_KEY)).toBe('[]');
  });
});
