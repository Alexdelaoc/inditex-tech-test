'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Icon } from '@/components/Icon/Icon';
import { useNavigation } from '@/components/Navigation/NavigationProvider';

import styles from './SearchBar.module.scss';

import type { SyntheticEvent } from 'react';

const DEBOUNCE_MS = 300;

interface SearchBarProps {
  resultsCount: number;
}

function hrefFor(term: string) {
  const trimmed = term.trim();

  return trimmed ? `/?${new URLSearchParams({ search: trimmed })}` : '/';
}

export function SearchBar({ resultsCount }: SearchBarProps) {
  const { navigate } = useNavigation();
  const searchParams = useSearchParams();
  const termInUrl = searchParams.get('search') ?? '';
  const [term, setTerm] = useState(termInUrl);

  useEffect(() => {
    if (term.trim() === termInUrl) {
      return;
    }

    const timeout = setTimeout(() => navigate(hrefFor(term)), DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [term, termInUrl, navigate]);

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    navigate(hrefFor(term));
  }

  return (
    <div className={styles.searchBar}>
      <form role="search" action="/" method="get" className={styles.form} onSubmit={handleSubmit}>
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
          onChange={(event) => setTerm(event.target.value)}
        />
        {term && (
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear the search"
            onClick={() => setTerm('')}
          >
            <Icon name="clear" />
          </button>
        )}
        <button type="submit" className="visually-hidden">
          Search
        </button>
      </form>

      <p className={styles.results} aria-live="polite" aria-atomic="true">
        <span>
          {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
        </span>
      </p>
    </div>
  );
}
