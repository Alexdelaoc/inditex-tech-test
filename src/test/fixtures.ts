import type { Product, ProductListItem } from '@/lib/api/types';
import type { CartEntry, CartLine } from '@/modules/cart/types';

export function aProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'SMG-S24U',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    basePrice: 1229,
    description: 'The Galaxy S24 Ultra with a 200 Mpx camera and an S Pen built in.',
    rating: 4.6,
    specs: {
      screen: '6.8" Dynamic AMOLED 2X',
      resolution: '3120 x 1440 pixels',
      processor: 'Snapdragon 8 Gen 3 for Galaxy',
      mainCamera: '200 MP + 50 MP + 12 MP + 10 MP',
      selfieCamera: '12 MP',
      battery: '5000 mAh',
      os: 'Android 14',
      screenRefreshRate: '120 Hz',
    },
    colorOptions: [
      { name: 'Titanium Black', hexCode: '#000000', imageUrl: 'https://example.com/black.webp' },
      { name: 'Titanium Violet', hexCode: '#8E6F96', imageUrl: 'https://example.com/violet.webp' },
      { name: 'Titanium Yellow', hexCode: '#FFD700', imageUrl: 'https://example.com/yellow.webp' },
    ],
    storageOptions: [
      { capacity: '256 GB', price: 1229 },
      { capacity: '512 GB', price: 1349 },
      { capacity: '1 TB', price: 1589 },
    ],
    similarProducts: [
      aProductListItem({ id: 'APL-IP15PM', brand: 'Apple', name: 'iPhone 15 Pro Max' }),
      aProductListItem({ id: 'GPX-8PRO', brand: 'Google', name: 'Pixel 8 Pro' }),
    ],
    ...overrides,
  };
}

export function aProductListItem(overrides: Partial<ProductListItem> = {}): ProductListItem {
  return {
    id: 'XMI-RN13P5G',
    brand: 'Xiaomi',
    name: 'Redmi Note 13 Pro 5G',
    basePrice: 399,
    imageUrl: 'https://example.com/redmi.webp',
    ...overrides,
  };
}

export function aCartLine(overrides: Partial<CartLine> = {}): CartLine {
  return {
    id: 'line-1',
    productId: 'SMG-S24U',
    name: 'Galaxy S24 Ultra',
    imageUrl: 'https://example.com/violet.webp',
    color: 'Titanium Violet',
    storage: '512 GB',
    price: 1349,
    ...overrides,
  };
}

export function anEntryFor({ id, productId, color, storage }: CartLine): CartEntry {
  return { id, productId, color, storage };
}
