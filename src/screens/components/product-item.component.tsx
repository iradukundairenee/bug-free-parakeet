'use client';

import React, { useState } from 'react';
import { Product, UpdateProductData } from '../../types/product.types';
import { Button } from '../../layout/forms/button.layout';
import { Popconfirm } from 'antd';

interface ProductItemProps {
  product: Product;
  onUpdate: (productId: string, updateData: UpdateProductData) => Promise<void>;
  onDelete: (productId: string) => Promise<void>;
  isEditing: boolean;
  onEditStart: () => void;
  onEditCancel: () => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({
  product,
  onUpdate,
  onDelete,
  isEditing,
  onEditStart,
  onEditCancel
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(product.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {product.name}
          </h3>
          {product.comment && (
            <p className="text-sm text-gray-600 mt-1">
              {product.comment}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="font-medium text-lg text-gray-900">
              Amount: {product.amount}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            onClick={onEditStart}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Product"
            description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            okText="Delete"
            cancelText="Cancel"
            okType="danger"
          >
            <Button
              variant="danger"
              size="sm"
              disabled={loading}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
};
