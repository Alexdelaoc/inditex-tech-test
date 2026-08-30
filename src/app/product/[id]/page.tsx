import { notFound } from 'next/navigation';

import { BackLink } from '@/components/BackLink/BackLink';
import { getProduct, getProducts } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { ProductConfigurator } from '@/modules/products/ProductConfigurator/ProductConfigurator';
import { SimilarProducts } from '@/modules/products/SimilarProducts/SimilarProducts';
import { SpecsTable } from '@/modules/products/SpecsTable/SpecsTable';

import styles from './page.module.scss';

import type { Product } from '@/lib/api/types';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();

  return [...new Set(products.map((product) => product.id))].map((id) => ({ id }));
}

async function findProduct(id: string): Promise<Product> {
  try {
    return await getProduct(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await findProduct(id);

  return (
    <>
      <BackLink />

      <div className={styles.page}>
        <ProductConfigurator product={product} />
        <SpecsTable specs={product.specs} />
        <SimilarProducts products={product.similarProducts} />
      </div>
    </>
  );
}
