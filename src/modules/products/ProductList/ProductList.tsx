import type { ProductListItem } from '@/lib/api/types';

export function ProductList({ products }: { products: ProductListItem[] }) {
  return (
    <ul>
      {products.map((product, index) => (
        <li key={`${product.id}-${index}`}>
          <span>{product.brand}</span> <span>{product.name}</span>{' '}
          <span>{product.basePrice} EUR</span>
        </li>
      ))}
    </ul>
  );
}
