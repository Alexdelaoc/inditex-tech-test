'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useRef, useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { ResultsCount } from '@/modules/products/ResultsCount/ResultsCount';

import styles from './SearchBar.module.scss';

import type { ProductListItem } from '@/lib/api/types';
import type { SyntheticEvent } from 'react';

const DEBOUNCE_MS = 300;

interface SearchBarProps {
  products: Promise<ProductListItem[]>;
}

function hrefFor(term: string) {
  const trimmed = term.trim();

  return trimmed ? `/?${new URLSearchParams({ search: trimmed })}` : '/';
}

export function SearchBar({ products }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const termInUrl = searchParams.get('search') ?? '';
  const [term, setTerm] = useState(termInUrl);
  const pendingSearch = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancelPendingSearchOnUnmount = useCallback(
    () => () => clearTimeout(pendingSearch.current),
    [],
  );

  function search(next: string) {
    clearTimeout(pendingSearch.current);
    setTerm(next);
    pendingSearch.current = setTimeout(() => router.replace(hrefFor(next)), DEBOUNCE_MS);
  }

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    clearTimeout(pendingSearch.current);
    router.replace(hrefFor(term));
  }

  return (
    <div className={styles.searchBar}>
      <form
        ref={cancelPendingSearchOnUnmount}
        role="search"
        action="/"
        method="get"
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <label htmlFor="product-search" className="visually-hidden">
          Search for a smartphone
        </label>
        <input
          id="product-search"
          name="search"
          type="search"
          className={styles.input}
          placeholder="Search for a smartphone..."
          value={term}
          onChange={(event) => search(event.target.value)}
        />
        {term && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear the search"
            onClick={() => search('')}
          >
            <Icon name="clear" />
          </button>
        )}
        <button type="submit" className="visually-hidden">
          Search
        </button>
      </form>

      <p className={styles.results} aria-live="polite" aria-atomic="true">
        <Suspense fallback={null}>
          <ResultsCount products={products} />
        </Suspense>
      </p>
    </div>
  );
}
