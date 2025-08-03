// service/api/products.api.ts

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { Product, CreateProductData, UpdateProductData, ProductFilters, productConverter } from '../../types/product.types';
import { auth, db } from '@/firebase/config';

export class ProductsApi {
  private static readonly COLLECTION_NAME = 'products';

  /**
   * Get current user ID
   */
  private static getCurrentUserId(): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }

  /**
   * Create a new product
   */
  static async createProduct(productData: CreateProductData): Promise<Product> {
    try {
      const productsCollection = collection(db, this.COLLECTION_NAME);
      
      // Get the current highest order for ordering
      const userProductsQuery = query(
        productsCollection,
        orderBy('order', 'desc')
      );
      const snapshot = await getDocs(userProductsQuery);
      const highestOrder = snapshot.empty ? 0 : (snapshot.docs[0].data().order || 0);

      const newProduct = {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        order: highestOrder + 1
      };

      const docRef = await addDoc(productsCollection, newProduct);
      
      // Get the created document to return with proper timestamps
      const createdDoc = await getDoc(docRef);
      if (!createdDoc.exists()) {
        throw new Error('Failed to retrieve created product');
      }

      return productConverter.fromFirestore(createdDoc, {});
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.message || 'Failed to create product');
    }
  }

  /**
   * Get all products for the current user
   */
  static async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
     
      const productsCollection = collection(db, this.COLLECTION_NAME);
      
      let productQuery = query(
        productsCollection,
        orderBy('order', 'asc')
      );

      const querySnapshot = await getDocs(productQuery);
      let products = querySnapshot.docs.map(doc => productConverter.fromFirestore(doc, {}));

      // Apply client-side filters if provided
      if (filters) {
        products = this.applyFilters(products, filters);
      }

      return products;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(error.message || 'Failed to fetch products');
    }
  }

  /**
   * Update a product
   */
  static async updateProduct(productId: string, updateData: UpdateProductData): Promise<Product> {
    try {
      const userId = this.getCurrentUserId();
      const productRef = doc(db, this.COLLECTION_NAME, productId);
      
      

      const updatePayload = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(productRef, updatePayload);
      
      // Get the updated document
      const updatedDoc = await getDoc(productRef);
      return productConverter.fromFirestore(updatedDoc, {});
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(error.message || 'Failed to update product');
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, this.COLLECTION_NAME, productId);
      
    
    
      
      await deleteDoc(productRef);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw new Error(error.message || 'Failed to delete product');
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(productId: string): Promise<Product> {
    try {
      const userId = this.getCurrentUserId();
      const productRef = doc(db, this.COLLECTION_NAME, productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }
      
      const product = productConverter.fromFirestore(productDoc, {});
      
    
      return product;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      throw new Error(error.message || 'Failed to fetch product');
    }
  }

  /**
   * Reorder products
   */
  static async reorderProducts(productIds: string[]): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      const batch = writeBatch(db);

      // Update each product with its new order
      productIds.forEach((productId, index) => {
        const productRef = doc(db, this.COLLECTION_NAME, productId);
        batch.update(productRef, {
          order: index + 1,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error: any) {
      console.error('Error reordering products:', error);
      throw new Error(error.message || 'Failed to reorder products');
    }
  }

  /**
   * Apply client-side filters to products
   */
  private static applyFilters(products: Product[], filters: ProductFilters): Product[] {
    return products.filter(product => {
      // Category filter
      if (filters.category && product.category !== filters.category) {
        return false;
      }

      // Stock filter
      if (filters.inStock !== undefined && product.inStock !== filters.inStock) {
        return false;
      }

      // Price range filter
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      // Search filter (name and description)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const descriptionMatch = product.description.toLowerCase().includes(searchTerm);
        if (!nameMatch && !descriptionMatch) {
          return false;
        }
      }

      return true;
    });
  }

 

  /**
   * Get products count for the current user
   */
  static async getProductsCount(): Promise<number> {
    try {
      const products = await this.getProducts();
      return products.length;
    } catch (error: any) {
      console.error('Error fetching products count:', error);
      return 0;
    }
  }
}
