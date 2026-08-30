import { ProductGrid } from '@/modules/products/ProductGrid/ProductGrid';
import { SearchBar } from '@/modules/products/SearchBar/SearchBar';
import { getProducts } from '@/lib/api/client';

import styles from './page.module.scss';

const INITIAL_PRODUCTS = 20;

interface HomePageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search } = await searchParams;
  const products = await getProducts(search ? { search } : { limit: INITIAL_PRODUCTS });

  return (
    <div className={styles.page}>
      <SearchBar resultsCount={products.length} />
      <ProductGrid products={products} />
    </div>
  );
}
