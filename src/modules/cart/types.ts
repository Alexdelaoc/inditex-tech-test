export interface CartEntry {
  id: string;
  productId: string;
  color: string;
  storage: string;
}

export interface CartLine extends CartEntry {
  name: string;
  imageUrl: string;
  price: number;
}
