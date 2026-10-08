import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      json: async () => ({ envKeys: { anthropic: false, google: false } }),
    }));
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('저장된 Provider를 복원한다', () => {
    localStorage.setItem('react-component-generator.provider', JSON.stringify('anthropic'));

    render(<App />);

    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
  });
});
