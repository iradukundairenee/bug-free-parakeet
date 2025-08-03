import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config';
import { Product, CreateProductData, UpdateProductData } from '../../types/product.types';

const COLLECTION_NAME = 'products';

export class ProductsCollection {
  /**
   * Get all products for a specific user
   */
  static async getUserProducts(userId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('order', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name,
          amount: data.amount,
          comment: data.comment,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          order: data.order || 0,
        });
      });
      
      return products;
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(productId: string): Promise<Product | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          amount: data.amount,
          comment: data.comment,
          userId: data.userId,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          order: data.order || 0,
        };
      }
      
      return null;
    } catch (error) {
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Create a new product
   */
  static async createProduct(userId: string, productData: CreateProductData): Promise<Product> {
    try {
      // Get the highest order number for this user
      const userProducts = await this.getUserProducts(userId);
      const maxOrder = userProducts.length > 0 ? Math.max(...userProducts.map(p => p.order)) : -1;
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...productData,
        userId,
        order: maxOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      const newProduct = await this.getProduct(docRef.id);
      if (!newProduct) {
        throw new Error('Failed to create product');
      }
      
      return newProduct;
    } catch (error) {
      throw new Error('Failed to create product');
    }
  }

  /**
   * Update a product
   */
  static async updateProduct(productId: string, productData: UpdateProductData): Promise<Product> {
    try {
      const docRef = doc(db, COLLECTION_NAME, productId);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp(),
      });
      
      const updatedProduct = await this.getProduct(productId);
      if (!updatedProduct) {
        throw new Error('Failed to update product');
      }
      
      return updatedProduct;
    } catch (error) {
      throw new Error('Failed to update product');
    }
  }

  /**
   * Delete a product
   */
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, productId);
      await deleteDoc(docRef);
    } catch (error) {
      throw new Error('Failed to delete product');
    }
  }

  /**
   * Reorder products
   */
  static async reorderProducts(userId: string, productIds: string[]): Promise<void> {
    try {
      const batch = [];
      
      for (let i = 0; i < productIds.length; i++) {
        const docRef = doc(db, COLLECTION_NAME, productIds[i]);
        batch.push(updateDoc(docRef, { order: i }));
      }
      
      await Promise.all(batch);
    } catch (error) {
      throw new Error('Failed to reorder products');
    }
  }
}
