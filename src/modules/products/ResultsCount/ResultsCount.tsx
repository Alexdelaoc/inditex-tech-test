'use client';

import { use } from 'react';

import type { ProductListItem } from '@/lib/api/types';

export function resultsLabel(count: number) {
  return `${count} ${count === 1 ? 'result' : 'results'}`;
}

export function ResultsCount({ products }: { products: Promise<ProductListItem[]> }) {
  return <span>{resultsLabel(use(products).length)}</span>;
}
