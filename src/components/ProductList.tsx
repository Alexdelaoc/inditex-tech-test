import type { ProductListItem } from '@/lib/api/types';

export function ProductList({ products }: { products: ProductListItem[] }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <span>{product.brand}</span> <span>{product.name}</span>{' '}
          <span>{product.basePrice} EUR</span>
        </li>
      ))}
    </ul>
  );
}
