import { Header } from '@/components/Header/Header';
import { NavigationProgress } from '@/components/Navigation/NavigationProgress';
import { NavigationProvider } from '@/components/Navigation/NavigationProvider';
import { CartProvider } from '@/modules/cart/CartProvider';

import styles from './layout.module.scss';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'Zara Web Challenge',
  description: 'Browse, search and buy smartphones',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavigationProvider>
          <CartProvider>
            <Header />
            <NavigationProgress />
            <main className={styles.main}>{children}</main>
          </CartProvider>
        </NavigationProvider>
      </body>
    </html>
  );
}
