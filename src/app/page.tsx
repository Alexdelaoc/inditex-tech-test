import { ProductList } from '@/modules/products/ProductList/ProductList';
import { SearchBar } from '@/modules/products/SearchBar/SearchBar';
import { getProducts } from '@/lib/api/client';

const INITIAL_PRODUCTS = 20;

interface HomePageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search } = await searchParams;
  const products = await getProducts(search ? { search } : { limit: INITIAL_PRODUCTS });

  return (
    <>
      <SearchBar resultsCount={products.length} />
      <ProductList products={products} />
    </>
  );
}
