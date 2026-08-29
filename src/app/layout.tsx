import { Header } from '@/components/Header/Header';

import styles from './layout.module.scss';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'Zara Web Challenge',
  description: 'Catálogo de teléfonos móviles',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}
