import { ProductList } from '@/components/ProductList';
import { getProducts } from '@/lib/api/client';

export default async function HomePage() {
  const products = await getProducts({ limit: 20 });

  return (
    <main>
      <h1>Zara Web Challenge!</h1>
      <p>{products.length} resultados</p>
      <ProductList products={products} />
    </main>
  );
}
