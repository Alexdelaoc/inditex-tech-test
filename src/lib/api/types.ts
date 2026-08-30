export interface ProductListItem {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  imageUrl: string;
}

export type ColorOption = {
  name: string;
  hexCode: string;
  imageUrl: string;
};

export type StorageOption = {
  capacity: string;
  price: number;
};

export type ProductSpecs = {
  screen: string;
  resolution: string;
  processor: string;
  mainCamera: string;
  selfieCamera: string;
  battery: string;
  os: string;
  screenRefreshRate: string;
};

export interface Product {
  id: string;
  brand: string;
  name: string;
  basePrice: number;
  description: string;
  rating: number;
  specs: ProductSpecs;
  colorOptions: ColorOption[];
  storageOptions: StorageOption[];
  similarProducts: ProductListItem[];
}

export interface ApiErrorBody {
  error: string;
  message: string;
}
