import { NextRequest, NextResponse } from 'next/server';
import { ProductsService } from '../../../../service/products.service';
import { UpdateProductData } from '../../../../types/product.types';
import { AuthService } from '../../../../firebase/auth.service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from Firebase auth
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await ProductsService.getProduct(params.id, currentUser.uid);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from Firebase auth
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const productData: UpdateProductData = {
      name: body.name,
      amount: body.amount,
      comment: body.comment,
    };

    const product = await ProductsService.updateProduct(params.id, currentUser.uid, productData);
    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from Firebase auth
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ProductsService.deleteProduct(params.id, currentUser.uid);
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 400 }
    );
  }
} 