'use client';

import React from 'react';
import { ShoppingBag, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { cart } = useCart();
  const itemCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <ChefHat size={18} color="#000" />
          </div>
          <span className={styles.logoText}>
            MIDNIGHT <span className={styles.logoBistro}>BISTRO</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/cart" className={styles.cartIconLink}>
            <ShoppingBag size={18} color="var(--primary)" />
            {itemCount > 0 && (
              <span className={styles.badge}>
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
