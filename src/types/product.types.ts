// types/product.types.ts

export interface Product {
  id: string;
  name: string;
  amount: number;
  comment: string;
  userId: string; // To associate products with users
  order?: number; // For reordering functionality
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductData {
  name: string;
  amount: number;
  comment: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  updatedAt?: Date;
}

export interface ProductFilters {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// Firebase document converter
export const productConverter = {
  toFirestore(product: Omit<Product, 'id'>): any {
    return {
      ...product,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  },
  fromFirestore(snapshot: any, options: any): Product {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Product;
  }
};
