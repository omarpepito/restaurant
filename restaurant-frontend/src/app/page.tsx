'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';

import styles from './page.module.css';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await apiClient.get<Product[]>('/products');
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={`${styles.title} ${styles.fadeIn}`}>
          MIDNIGHT BISTRO
        </h1>

        <p className={`${styles.subtitle} ${styles.fadeIn}`} style={{ animationDelay: '0.2s' }}>
          Artisanal flavours meets late-night cravings. Explore our masterfully
          curated menu, designed for the truly discerning palate.
        </p>
      </header>

      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className="animate-pulse">Loading amazing flavors...</div>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {products.length === 0 && !isLoading && (
        <div className={styles.emptyContainer}>
          <h3 className={styles.emptyTitle}>Menu is currently offline</h3>
          <p className={styles.emptyText}>Check back later for our new seasonal selections.</p>
        </div>
      )}
    </div>
  );
}
