import { act, render, screen } from '@testing-library/react';
import { Suspense } from 'react';

import { ResultsCount } from './ResultsCount';

import type { ProductListItem } from '@/lib/api/types';

function products(howMany: number): ProductListItem[] {
  return Array.from({ length: howMany }, (_, index) => ({
    id: String(index),
    brand: 'Apple',
    name: `iPhone ${index}`,
    basePrice: 909,
    imageUrl: 'https://example.com/iphone.jpg',
  }));
}

async function renderCount(howMany: number) {
  await act(async () => {
    render(
      <Suspense fallback={null}>
        <ResultsCount products={Promise.resolve(products(howMany))} />
      </Suspense>,
    );
  });
}

describe('ResultsCount', () => {
  it('counts what the promise resolves to', async () => {
    await renderCount(19);

    expect(screen.getByText('19 results')).toBeInTheDocument();
  });

  it('keeps the singular in agreement when there is a single result', async () => {
    await renderCount(1);

    expect(screen.getByText('1 result')).toBeInTheDocument();
  });
});
