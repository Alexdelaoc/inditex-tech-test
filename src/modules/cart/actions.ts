'use server';

import { randomBytes } from 'node:crypto';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getProduct } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { configure, readChoice } from '@/modules/products/configuration';

import {
  CART_COOKIE,
  cartCookieOptions,
  decodeCart,
  encodeCart,
  exceedsCookieLimit,
} from './cartCookie';

import type { CartEntry } from './types';
import type { Product } from '@/lib/api/types';

export interface AddToCartState {
  error: string | null;
}

const NOT_AVAILABLE = 'This configuration is not available.';
const TRY_AGAIN = 'We could not add it right now. Please try again.';
const CART_FULL = 'Your cart is full. Remove something before adding more.';

async function readCart() {
  const cookieStore = await cookies();

  return { cookieStore, entries: decodeCart(cookieStore.get(CART_COOKIE)?.value) };
}

async function isHttps() {
  return (await headers()).get('x-forwarded-proto') === 'https';
}

export async function addToCart(
  productId: string,
  _previous: AddToCartState,
  formData: FormData,
): Promise<AddToCartState> {
  let product: Product;

  try {
    product = await getProduct(productId);
  } catch (error) {
    return { error: error instanceof ApiError && error.status === 404 ? NOT_AVAILABLE : TRY_AGAIN };
  }

  const configuration = configure(product, readChoice(formData));

  if (!configuration) {
    return { error: NOT_AVAILABLE };
  }

  const { cookieStore, entries } = await readCart();
  const line: CartEntry = {
    id: randomBytes(6).toString('base64url'),
    productId: product.id,
    color: configuration.color,
    storage: configuration.storage,
  };
  const encoded = encodeCart([...entries, line]);

  if (exceedsCookieLimit(encoded)) {
    return { error: CART_FULL };
  }

  cookieStore.set(CART_COOKIE, encoded, cartCookieOptions(await isHttps()));
  redirect('/cart');
}

export async function removeFromCart(lineId: string): Promise<void> {
  const { cookieStore, entries } = await readCart();
  const remaining = entries.filter((entry) => entry.id !== lineId);

  cookieStore.set(CART_COOKIE, encodeCart(remaining), cartCookieOptions(await isHttps()));
}
