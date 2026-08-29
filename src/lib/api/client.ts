import { ApiError } from './errors';

import type { ApiErrorBody, Product, ProductListItem } from './types';

const REVALIDATE_SECONDS = 3600;

interface GetProductsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

function readCredentials(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env.API_BASE_URL;
  const apiKey = process.env.API_KEY;

  if (!baseUrl) {
    throw new Error('Missing API_BASE_URL environment variable');
  }

  if (!apiKey) {
    throw new Error('Missing API_KEY environment variable');
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    return body.message ?? body.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

async function request<T>(path: string): Promise<T> {
  const { baseUrl, apiKey } = readCredentials();

  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'x-api-key': apiKey },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}

function uniqueById(products: ProductListItem[]): ProductListItem[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    if (seen.has(product.id)) {
      return false;
    }

    seen.add(product.id);
    return true;
  });
}

export async function getProducts(params: GetProductsParams = {}): Promise<ProductListItem[]> {
  const { search, limit, offset } = params;
  const query = new URLSearchParams();

  if (search) {
    query.set('search', search);
  }

  if (limit !== undefined) {
    query.set('limit', String(limit));
  }

  if (offset !== undefined) {
    query.set('offset', String(offset));
  }

  const queryString = query.toString();

  const products = await request<ProductListItem[]>(
    `/products${queryString ? `?${queryString}` : ''}`,
  );

  return uniqueById(products);
}

export function getProduct(id: string): Promise<Product> {
  return request<Product>(`/products/${encodeURIComponent(id)}`);
}
