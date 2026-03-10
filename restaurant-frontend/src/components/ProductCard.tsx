'use client';

import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';
import ModifierSelector from './ModifierSelector';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { addToCart } = useCart();

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async (modifiers: Record<string, string[]> = {}) => {
    try {
      await addToCart(product.id, 1, modifiers);
      setIsCustomizing(false);
      showToast('success', 'Item added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('error', 'Error adding item to cart');
    }
  };

  const onAddClick = () => {
    if (product.modifiers && product.modifiers.length > 0) {
      setIsCustomizing(true);
    } else {
      handleAdd();
    }
  };

  return (
    <>
      <div className={`${styles.card} ${styles.fadeIn}`}>
        <div className={styles.infoRow}>
          <h3 className={styles.name}>{product.name}</h3>
          <span className={styles.price}>${(product.price / 100).toFixed(2)}</span>
        </div>

        <p className={styles.description}>
          {product.description || "Indulge in our masterfully crafted selection, prepared fresh with premium ingredients."}
        </p>

        <div className={styles.buttonContainer}>
          <button onClick={onAddClick} className={styles.smallBtn}>
            <Plus size={14} strokeWidth={3} />
            <span>{product.modifiers && product.modifiers.length > 0 ? 'CUSTOMIZE' : 'ADD'}</span>
          </button>
        </div>
      </div>

      {isCustomizing && (
        <ModifierSelector
          product={product}
          onConfirm={handleAdd}
          onCancel={() => setIsCustomizing(false)}
        />
      )}

      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === 'success' ? styles.toastSuccess : styles.toastError
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  );
};

export default ProductCard;
