export type ProductSummary = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  mrp: number;
  rating: number;
  reviewCount: number;
  images: string[];
  categorySlug: string;
  categoryName: string;
};

export type ProductDetail = ProductSummary & {
  description: string;
  stock: number;
  reviews: {
    id: string;
    author: string;
    rating: number;
    title: string;
    body: string;
    createdAt: string;
  }[];
};

export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  stock: number;
};

export type OrderSummary = {
  id: string;
  createdAt: string;
  status: string;
  total: number;
  paymentMethod: string;
  items: {
    title: string;
    image: string;
    price: number;
    quantity: number;
  }[];
};
