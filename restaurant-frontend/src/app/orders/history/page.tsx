'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { Order } from '@/types';
import { useUser } from '@/context/UserContext';
import { ArrowRight, ExternalLink, Package } from 'lucide-react';
import Link from 'next/link';
import styles from './history.module.css';

export default function OrderHistoryPage() {
  const { userId } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await apiClient.get<Order[]>(`/orders/user/${userId}`);
        setOrders(data.sort((a, b) => (a.status === 'CART' ? 1 : -1)));
      } catch (error) {
        console.error('Failed to load history', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [userId]);

  return (
    <div className={styles.container}>
      <main className={styles.inner}>
        <h1 className={styles.title}>
          ORDER <span className={styles.highlight}>HISTORY</span>
        </h1>

        <div className={styles.ordersList}>
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className={`${styles.skeletonCard} glass-card`} />
            ))
          ) : orders.length === 0 ? (
            <div className={`${styles.emptyState} glass-card`}>
              No orders found yet.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={`${styles.orderCard} glass-card`}>
                <div className={styles.orderInfo}>
                  <div className={`${styles.iconWrapper} ${order.status === 'CART' ? styles.iconCart : styles.iconOrder}`}>
                    <Package size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className={styles.statusLabel}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <h4 className={styles.orderName}>Order #{order.id.slice(0, 8).toUpperCase()}</h4>
                    <p className={styles.orderMeta}>
                      Total: ${(order.total / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className={styles.itemsContainer}>
                    {order.items.map((item, idx) => (
                      <div key={`${order.id}-item-${idx}`} className={styles.itemRow}>
                        <div className={styles.itemInfo}>
                          <span className={styles.itemQty}>{item.quantity}x</span>
                          <span className={styles.itemName}>
                            {item.product?.name ?? `Item #${item.id.slice(0, 5)}`}
                          </span>
                        </div>
                        <span className={styles.itemTotal}>
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.orderFooter}>
                  <Link 
                    href={`/orders/${order.id}`}
                    className={styles.actionLink}
                  >
                    <span>See Details</span>
                    <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
