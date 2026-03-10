'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/api/client';
import { Order } from '@/types';
import { Clock, CheckCircle2, Package, Receipt, ArrowLeft, MapPin } from 'lucide-react';
import Link from 'next/link';
import styles from './status.module.css';

export default function OrderStatusPage() {
   const { orderId } = useParams() as { orderId: string };
   const [order, setOrder] = useState<Order | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   const fetchData = async () => {
      try {
         const { data } = await apiClient.get<Order>(`/orders/${orderId}`);
         setOrder(data);
      } catch (error) {
         console.error('Failed to load order info', error);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchData();
      const interval = setInterval(fetchData, 10000);
      return () => clearInterval(interval);
   }, [orderId]);

   console.log(order);
   const getStatusIcon = (status: string) => {
      switch (status) {
         case 'ORDER_PLACED': return <Clock size={40} color="var(--primary)" />;
         case 'ORDER_COMPLETED': return <CheckCircle2 size={40} color="#22c55e" />;
         default: return <Package size={40} color="var(--muted)" />;
      }
   };

   if (isLoading) return <div className={styles.loading}>Loading Order Details...</div>;

   const subtotal = order?.subtotal || 0;
   const tax = Math.round(subtotal * 0.08);
   const serviceFee = 100; // $1.00
   const total = subtotal + tax + serviceFee;

   return (
      <div className={styles.container}>
         <main className={styles.inner}>
            {/* Status Header */}
            <div className={`${styles.statusCard} glass-card`}>
               <div className={`${styles.iconContainer} ${styles.hideSm}`}>
                  <div className={styles.iconGlow} />
                  <div className={styles.iconBox}>
                     {getStatusIcon(order?.status || '')}
                  </div>
               </div>

               <div className={styles.headerInfo}>
                  <span className={styles.orderBadge}>
                     ORDER #{orderId.slice(0, 8).toUpperCase()}
                  </span>
                  <h1 className={styles.statusTitle}>
                     {order?.status.replace(/_/g, ' ') || 'PROCESSING'}
                  </h1>
                  <p className={styles.statusDesc}>
                     Your order is currently being prepared by our world-class chefs.
                  </p>
               </div>

               <div className={styles.totalAmount}>
                  ${((order?.total || 0) / 100).toFixed(2)}
               </div>
            </div>

            {/* Receipt Section */}
            <div className={`${styles.receiptContainer} glass-card`}>
               <div className={styles.receiptHeader}>
                  <Receipt size={20} color="var(--primary)" />
                  <h2 className={styles.receiptTitle}>Order Receipt</h2>
               </div>

               <div className={styles.receiptItems}>
                  {order?.items.map((item, idx) => (
                     <div key={`receipt-item-${idx}`} className={styles.receiptItem}>
                        <div className={styles.itemLabel}>
                           <div className={styles.itemMain}>
                              <span className={styles.itemQty}>{item.quantity}x</span>
                              <span className={styles.itemName}>
                                 {item.product?.name ?? `Item #${item.id.slice(0, 5)}`}
                              </span>
                           </div>
                           <div className={styles.itemModifiers}>
                              {item.selectedModifiers && Object.entries(item.selectedModifiers).map(([key, vals]) =>
                                 (vals as string[]).map(v => (
                                    <span key={`${key}-${v}`} className={styles.modBadge}>{v}</span>
                                 ))
                              )}
                           </div>
                        </div>
                        <span className={styles.itemPrice}>
                           ${((item.price * item.quantity) / 100).toFixed(2)}
                        </span>
                     </div>
                  ))}
               </div>

               <div className={styles.receiptDivider} />

               <div className={styles.receiptSummary}>
                  <div className={styles.receiptRow}>
                     <span>Subtotal</span>
                     <span>${(subtotal / 100).toFixed(2)}</span>
                  </div>
                  <div className={styles.receiptRow}>
                     <span>Tax (8%)</span>
                     <span>${(tax / 100).toFixed(2)}</span>
                  </div>
                  <div className={styles.receiptRow}>
                     <span>Service Fee</span>
                     <span>$1.00</span>
                  </div>
                  <div className={styles.receiptTotal}>
                     <span>Total Paid</span>
                     <span className={styles.totalHighlight}>${(total / 100).toFixed(2)}</span>
                  </div>
               </div>
            </div>

            {/* Navigation Actions */}
            <div className={styles.navActions}>
               <Link href={`/orders/${orderId}/timeline`} className={`${styles.trackBtn} btn-premium`}>
                  <MapPin size={20} />
                  <span>Track Order Timeline</span>
               </Link>
               <Link href="/orders/history" className={styles.backBtn}>
                  <ArrowLeft size={18} />
                  <span>Back to History</span>
               </Link>
            </div>
         </main>
      </div>
   );
}
