'use client';

import { useRef, useState } from 'react';

import styles from './Carousel.module.scss';

import type { ReactNode, UIEvent } from 'react';

export function Carousel({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const track = useRef<HTMLUListElement>(null);

  function handleScroll(event: UIEvent<HTMLUListElement>) {
    const { scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
    const travel = scrollWidth - clientWidth;

    setProgress(travel > 0 ? scrollLeft / travel : 0);
  }

  return (
    <div className={styles.carousel}>
      <ul ref={track} className={styles.track} onScroll={handleScroll}>
        {children}
      </ul>

      <div className={styles.bar} aria-hidden="true">
        <div
          className={styles.thumb}
          style={{ left: `${progress * 100}%`, transform: `translateX(-${progress * 100}%)` }}
        />
      </div>
    </div>
  );
}
