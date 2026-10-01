import { Header } from '@/components/Header/Header';
import { readCartEntries } from '@/modules/cart/cart';
import { CartProvider } from '@/modules/cart/CartProvider';

import styles from './layout.module.scss';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: { default: 'Zara Web Challenge', template: '%s | Zara Web Challenge' },
  description: 'Browse, search and buy smartphones',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const entries = await readCartEntries();

  return (
    <html lang="en">
      <body>
        <CartProvider entries={entries}>
          <Header />
          <main className={styles.main}>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
