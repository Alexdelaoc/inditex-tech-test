import { ProductList } from '@/modules/products/ProductList/ProductList';
import { SearchBar } from '@/modules/products/SearchBar/SearchBar';
import { getProducts } from '@/lib/api/client';

export default async function HomePage() {
  const products = await getProducts({ limit: 20 });

  return (
    <>
      <SearchBar resultsCount={products.length} />
      <ProductList products={products} />
    </>
  );
}
