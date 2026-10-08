import { render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { ComponentCard } from './ComponentCard';

vi.mock('./LivePreview', () => ({ LivePreview: () => <div>완성된 미리보기</div> }));
it('selects code while generating and preview on completion', () => {
  const props = { component: { id: '1', prompt: '카드', code: 'partial', createdAt: new Date() }, onRemove: vi.fn(), onRegenerate: vi.fn(), isLoading: true };
  const { rerender } = render(<ComponentCard {...props} isGenerating />);
  expect(screen.getByRole('button', { name: '코드' })).toHaveClass('tab--active');
  expect(screen.queryByText('완성된 미리보기')).toBeNull();
  rerender(<ComponentCard {...props} isLoading={false} isGenerating={false} />);
  expect(screen.getByRole('button', { name: '미리보기' })).toHaveClass('tab--active');
  expect(screen.getByText('완성된 미리보기')).toBeInTheDocument();
});
