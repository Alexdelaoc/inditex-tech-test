import { notFound } from 'next/navigation';

import { BackLink } from '@/components/BackLink/BackLink';
import { getProduct } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { ProductConfigurator } from '@/modules/products/ProductConfigurator/ProductConfigurator';
import { SimilarProducts } from '@/modules/products/SimilarProducts/SimilarProducts';
import { SpecsTable } from '@/modules/products/SpecsTable/SpecsTable';

import styles from './page.module.scss';

import type { Product } from '@/lib/api/types';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ id: string }>;
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

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await findProduct(id);

  return { title: product.name, description: product.description };
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
