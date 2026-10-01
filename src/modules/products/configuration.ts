import type { Product } from '@/lib/api/types';

export const CHOICE_FIELDS = { color: 'color', storage: 'storage' } as const;

export interface Choice {
  color?: string;
  storage?: string;
}

export interface Configuration {
  color: string;
  storage: string;
  price: number;
  imageUrl: string;
}

export interface Preview {
  price: number;
  isStartingPrice: boolean;
  imageUrl: string | undefined;
}

function findColor(product: Product, name: string | undefined) {
  return product.colorOptions.find((option) => option.name === name);
}

function findStorage(product: Product, capacity: string | undefined) {
  return product.storageOptions.find((option) => option.capacity === capacity);
}

export function configure(product: Product, choice: Choice): Configuration | null {
  const color = findColor(product, choice.color);
  const storage = findStorage(product, choice.storage);

  if (!color || !storage) {
    return null;
  }

  return {
    color: color.name,
    storage: storage.capacity,
    price: storage.price,
    imageUrl: color.imageUrl,
  };
}

export function preview(product: Product, choice: Choice): Preview {
  const storage = findStorage(product, choice.storage);
  const color = findColor(product, choice.color) ?? product.colorOptions[0];

  return {
    price: storage?.price ?? product.basePrice,
    isStartingPrice: !storage,
    imageUrl: color?.imageUrl,
  };
}

function readField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);

  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function readChoice(formData: FormData): Choice {
  return {
    color: readField(formData, CHOICE_FIELDS.color),
    storage: readField(formData, CHOICE_FIELDS.storage),
  };
}
