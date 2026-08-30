'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCart } from '@/modules/cart/CartProvider';

import styles from './ProductConfigurator.module.scss';

import type { ColorOption, Product, StorageOption } from '@/lib/api/types';

const SIZES = '(min-width: 64rem) 510px, (min-width: 48rem) 337px, 100vw';

export function ProductConfigurator({ product }: { product: Product }) {
  const { addLine } = useCart();
  const router = useRouter();
  const [storage, setStorage] = useState<StorageOption>();
  const [color, setColor] = useState<ColorOption>();
  const [previewedColor, setPreviewedColor] = useState<ColorOption>();
  const shownColor = color ?? product.colorOptions[0];
  const namedColor = previewedColor ?? color;

  function addToCart() {
    if (!storage || !color) {
      return;
    }

    addLine({
      productId: product.id,
      brand: product.brand,
      name: product.name,
      imageUrl: color.imageUrl,
      color: color.name,
      storage: storage.capacity,
      price: storage.price,
    });

    router.push('/cart');
  }

  return (
    <div className={styles.detail}>
      <div className={styles.figure}>
        {shownColor && (
          <Image
            src={shownColor.imageUrl}
            alt={product.name}
            fill
            sizes={SIZES}
            className={styles.image}
            priority
          />
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.identity}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>
            {storage ? `${storage.price} EUR` : `From ${product.basePrice} EUR`}
          </p>
        </div>

        <div role="group" aria-labelledby="storage-label" className={styles.group}>
          <p id="storage-label" className={styles.legend}>
            Storage. How much space do you need?
          </p>
          <div className={styles.storageOptions}>
            {product.storageOptions.map((option) => (
              <label key={option.capacity} className={styles.storage}>
                <input
                  type="radio"
                  name="storage"
                  value={option.capacity}
                  className="visually-hidden"
                  checked={storage?.capacity === option.capacity}
                  onChange={() => setStorage(option)}
                />
                <span>{option.capacity}</span>
              </label>
            ))}
          </div>
        </div>

        <div role="group" aria-labelledby="color-label" className={styles.group}>
          <p id="color-label" className={styles.legend}>
            Colour. Pick your favourite.
          </p>
          <div className={styles.colorPicker}>
            <div className={styles.colorOptions}>
              {product.colorOptions.map((option) => (
                <label
                  key={option.name}
                  className={styles.color}
                  onMouseEnter={() => setPreviewedColor(option)}
                  onMouseLeave={() => setPreviewedColor(undefined)}
                  onFocus={() => setPreviewedColor(option)}
                  onBlur={() => setPreviewedColor(undefined)}
                >
                  <input
                    type="radio"
                    name="color"
                    value={option.name}
                    aria-label={option.name}
                    className="visually-hidden"
                    checked={color?.name === option.name}
                    onChange={() => setColor(option)}
                  />
                  <span className={styles.swatch} style={{ backgroundColor: option.hexCode }} />
                </label>
              ))}
            </div>
            <p className={styles.colorName}>{namedColor?.name}</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.addToCart}
          disabled={!storage || !color}
          onClick={addToCart}
        >
          Add
        </button>
      </div>
    </div>
  );
}
