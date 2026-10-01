import Image from 'next/image';

import styles from './ProductConfigurator.module.scss';

import type { ColorOption } from '@/lib/api/types';

const SIZES = '(min-width: 64rem) 510px, (min-width: 48rem) 337px, 100vw';

interface ProductGalleryProps {
  name: string;
  options: ColorOption[];
  shownImageUrl: string | undefined;
}

export function ProductGallery({ name, options, shownImageUrl }: ProductGalleryProps) {
  return (
    <div className={styles.figure}>
      {options.map((option, index) => {
        const isShown = option.imageUrl === shownImageUrl;

        return (
          <Image
            key={option.name}
            src={option.imageUrl}
            alt={isShown ? name : ''}
            fill
            sizes={SIZES}
            className={styles.image}
            data-shown={isShown}
            priority={index === 0}
          />
        );
      })}
    </div>
  );
}
