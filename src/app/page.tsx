import { Suspense } from 'react';

import { getProducts } from '@/lib/api/client';
import { ProductResults } from '@/modules/products/ProductResults/ProductResults';
import { SearchBar } from '@/modules/products/SearchBar/SearchBar';

import styles from './page.module.scss';

const INITIAL_PRODUCTS = 20;

interface HomePageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search } = await searchParams;
  const products = getProducts(search ? { search } : { limit: INITIAL_PRODUCTS });

  return (
    <div className={styles.page}>
      <SearchBar products={products} />

      <Suspense key={search ?? ''} fallback={null}>
        <ProductResults products={products} />
      </Suspense>
    </div>
  );
}
