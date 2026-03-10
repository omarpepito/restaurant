'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Utensils, 
  History, 
  Settings, 
  ShoppingBag, 
  ChefHat,
  LayoutDashboard
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { userName } = useUser();

  const navItems = [
    { name: 'Menu', href: '/', icon: Utensils },
    { name: 'My Orders', href: '/orders/history', icon: History },
    { name: 'Product Manager', href: '/admin/products', icon: LayoutDashboard },
    { name: 'Cart', href: '/cart', icon: ShoppingBag },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoIcon}>
          <ChefHat size={20} color="#000" />
        </div>
        <span className={styles.logoText}>
          MIDNIGHT <span className={styles.logoBistro}>BISTRO</span>
        </span>
      </div>

      <nav className={styles.navSection}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>Discerning Palate</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
