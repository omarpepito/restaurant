'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, ArrowRight, CreditCard, Clock, CheckCircle2, AlertCircle, Plus, Minus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './cart.module.css';

export default function CheckoutPage() {
   const { cart, checkout, isLoading, updateQuantity, removeItem } = useCart();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [updatingItem, setUpdatingItem] = useState<string | null>(null);
   const router = useRouter();

   if (isLoading) return <div className={styles.loading}>Loading amazing flavors...</div>;

   const handleCheckout = async () => {
      setIsSubmitting(true);
      try {
         const orderId = await checkout();
         router.push(`/orders/${orderId}`);
      } catch (err) {
         console.error(err);
         setIsSubmitting(false);
      }
   };

   const handleQuantity = async (itemId: string, current: number, delta: number) => {
      const next = current + delta;
      if (next < 1) return;
      setUpdatingItem(itemId);
      await updateQuantity(itemId, next);
      setUpdatingItem(null);
   };

   const handleRemove = async (itemId: string) => {
      setUpdatingItem(itemId);
      await removeItem(itemId);
      setUpdatingItem(null);
   };

   const subtotal = cart?.subtotal || 0;
   const tax = Math.round(subtotal * 0.08);
   const total = subtotal + tax + 100;

   return (
      <div className={styles.container}>
         <main className={styles.inner}>
            <h1 className={styles.title}>
               REVIEW YOUR <span className={styles.highlight}>ORDER</span>
            </h1>

            <div className={styles.checkoutLayout}>
               {/* Order Details */}
               <div className={styles.itemsList}>
                  {!cart || cart.items.length === 0 ? (
                     <div className={`${styles.emptyState} glass-card`}>
                        <ShoppingBag size={64} color="var(--muted)" />
                        <p className={styles.emptyText}>Your bag is empty.</p>
                     </div>
                  ) : (
                     cart.items.map((item) => {
                        const isUpdating = updatingItem === item.id;
                        // Use the embedded product snapshot from the cart item
                        const productName = item.product?.name ?? `Item #${item.id.slice(0, 5)}`;
                        return (
                           <div key={item.id} className={`${styles.cartItem} glass-card ${isUpdating ? styles.cartItemUpdating : ''}`}>
                              <div className={styles.itemImage}>
                                 {item.product?.name?.[0] ?? '🍔'}
                              </div>
                              <div className={styles.itemContent}>
                                 <div className={styles.itemHeader}>
                                    <div>
                                       <h4 className={styles.itemName}>{productName}</h4>
                                       <span className={styles.itemPricePer}>
                                          ${(item.price / 100).toFixed(2)} each
                                       </span>
                                    </div>
                                    <span className={styles.itemTotal}>
                                       ${((item.price * item.quantity) / 100).toFixed(2)}
                                    </span>
                                 </div>

                                 {item.selectedModifiers && Object.keys(item.selectedModifiers).length > 0 && (
                                    <div className={styles.modifiers}>
                                       {Object.entries(item.selectedModifiers).map(([groupId, vals]) =>
                                          (vals as string[]).map(v => (
                                             <span key={`${groupId}-${v}`} className={styles.modifierBadge}>
                                                {v}
                                             </span>
                                          ))
                                       )}
                                    </div>
                                 )}

                                 <div className={styles.itemActions}>
                                    <div className={styles.qtyControl}>
                                       <button
                                          className={styles.qtyBtn}
                                          onClick={() => handleQuantity(item.id, item.quantity, -1)}
                                          disabled={isUpdating || item.quantity <= 1}
                                       >
                                          <Minus size={14} />
                                       </button>
                                       <span className={styles.qtyValue}>{item.quantity}</span>
                                       <button
                                          className={styles.qtyBtn}
                                          onClick={() => handleQuantity(item.id, item.quantity, 1)}
                                          disabled={isUpdating}
                                       >
                                          <Plus size={14} />
                                       </button>
                                    </div>
                                    <button
                                       className={styles.removeBtn}
                                       onClick={() => handleRemove(item.id)}
                                       disabled={isUpdating}
                                    >
                                       <Trash2 size={14} />
                                       <span>Remove</span>
                                    </button>
                                 </div>
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>

               {/* Checkout Card */}
               <div className={styles.summaryWrapper}>
                  <div className={`${styles.summaryCard} glass-card`}>
                     <h3 className={styles.summaryTitle}>Order Summary</h3>

                     <div className={styles.summaryDetails}>
                        <div className={styles.summaryRow}>
                           <span className={styles.rowLabel}>Subtotal</span>
                           <span className={styles.rowValue}>${(subtotal / 100).toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                           <span className={styles.rowLabel}>Tax (8%)</span>
                           <span className={styles.rowValue}>${(tax / 100).toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                           <span className={styles.rowLabel}>Service Fee</span>
                           <span className={styles.rowValue}>$1.00</span>
                        </div>
                        <div className={styles.totalRow}>
                           <span>Total</span>
                           <span className={styles.totalValue}>${(total / 100).toFixed(2)}</span>
                        </div>
                     </div>

                     <button
                        disabled={!cart || cart.items.length === 0 || isSubmitting}
                        onClick={handleCheckout}
                        className={`${styles.checkoutBtn} btn-premium`}
                        style={{ opacity: (!cart || cart.items.length === 0 || isSubmitting) ? 0.5 : 1 }}
                     >
                        {isSubmitting ? <Clock className={styles.animateSpin} size={18} /> : <CreditCard size={18} />}
                        <span>{isSubmitting ? 'Confirming...' : 'Place Order'}</span>
                        <ArrowRight size={18} />
                     </button>

                     <div className={styles.securityInfo}>
                        <div className={styles.securityItem}>
                           <CheckCircle2 size={12} color="#22c55e" />
                           <span>Secure Payment Protected</span>
                        </div>
                        <div className={styles.securityItem}>
                           <AlertCircle size={12} color="var(--primary)" />
                           <span>Idempotent protection active</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
