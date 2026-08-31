import Image from 'next/image';
import Link from 'next/link';

import { LinkProgress } from '@/components/Navigation/LinkProgress';

import styles from './ProductCard.module.scss';

import type { ProductListItem } from '@/lib/api/types';

const SIZES = '(min-width: 64rem) 25vw, (min-width: 48rem) 50vw, 100vw';

interface ProductCardProps {
  product: ProductListItem;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <Link href={`/product/${encodeURIComponent(product.id)}`} className={styles.card}>
      <LinkProgress />

      <span className={styles.figure}>
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes={SIZES}
          className={styles.image}
          priority={priority}
        />
      </span>

      <span className={styles.info}>
        <span className={styles.identity}>
          <span className={styles.brand}>{product.brand}</span>
          <span className={styles.name}>{product.name}</span>
        </span>
        <span className={styles.price}>{product.basePrice} EUR</span>
      </span>
    </Link>
  );
}
