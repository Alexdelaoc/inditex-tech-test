import { ProductGrid } from '@/modules/products/ProductGrid/ProductGrid';

import type { ProductListItem } from '@/lib/api/types';

export async function ProductResults({ products }: { products: Promise<ProductListItem[]> }) {
  return <ProductGrid products={await products} />;
}
