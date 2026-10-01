'use client';

import { useActionState, useState } from 'react';

import { addToCart } from '@/modules/cart/actions';
import { configure, preview } from '@/modules/products/configuration';

import { AddToCartButton } from './AddToCartButton';
import { ColorSelector } from './ColorSelector';
import { ProductGallery } from './ProductGallery';
import { StorageSelector } from './StorageSelector';

import styles from './ProductConfigurator.module.scss';

import type { Product } from '@/lib/api/types';
import type { Choice } from '@/modules/products/configuration';

function keepChoiceOnReset(form: HTMLFormElement) {
  const keep = (event: Event) => event.preventDefault();

  form.addEventListener('reset', keep);

  return () => form.removeEventListener('reset', keep);
}

export function ProductConfigurator({ product }: { product: Product }) {
  const [choice, setChoice] = useState<Choice>({});
  const [state, formAction] = useActionState(addToCart.bind(null, product.id), { error: null });
  const { price, isStartingPrice, imageUrl } = preview(product, choice);

  return (
    <div className={styles.detail}>
      <ProductGallery name={product.name} options={product.colorOptions} shownImageUrl={imageUrl} />

      <form ref={keepChoiceOnReset} action={formAction} className={styles.info}>
        <div className={styles.identity}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>{isStartingPrice ? `From ${price} EUR` : `${price} EUR`}</p>
        </div>

        <StorageSelector
          options={product.storageOptions}
          selected={choice.storage}
          onSelect={(storage) => setChoice((current) => ({ ...current, storage }))}
        />
        <ColorSelector
          options={product.colorOptions}
          selected={choice.color}
          onSelect={(color) => setChoice((current) => ({ ...current, color }))}
        />
        <AddToCartButton disabled={configure(product, choice) === null} />

        {state.error && (
          <p role="alert" className={styles.error}>
            {state.error}
          </p>
        )}
      </form>
    </div>
  );
}
