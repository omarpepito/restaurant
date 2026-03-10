'use client';

import React, { useState } from 'react';
import apiClient from '@/api/client';
import { PackagePlus, Plus, Sparkles, Info } from 'lucide-react';
import styles from './admin.module.css';

export default function ProductsManager() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      await apiClient.post('/products', {
        name,
        price: Math.round(parseFloat(price) * 100),
        modifiers: [
          {
            id: 'mod_protein',
            name: 'Protein',
            options: ['Beef', 'Chicken', 'Veggies'],
            required: true,
            maxSelect: 1
          }
        ]
      });
      setStatus('Product created successfully!');
      setName('');
      setPrice('');
    } catch (error) {
      setStatus('Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.inner}>
        <div className={`${styles.card} glass-card`}>
          <div className={styles.header}>
            <div className={styles.iconWrapper}>
              <PackagePlus size={24} color="#000" />
            </div>
            <h1 className={styles.title}>Product Manager</h1>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Product Name</label>
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Master Chef Burger"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Price (USD)</label>
              <input 
                required
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12.50"
                className={styles.input}
              />
            </div>

            <div className={styles.infoBox}>
              <Info size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p className={styles.infoText}>
                Products are automatically created with a default <strong className={styles.infoHighlight}>Protein</strong> modifier group to satisfy the multi-modifier requirement.
              </p>
            </div>

            <button 
              disabled={isSubmitting}
              className={`${styles.submitBtn} btn-premium`}
              style={{ opacity: isSubmitting ? 0.5 : 1 }}
            >
              {isSubmitting ? (
                <Sparkles size={18} className={styles.animatePulse} />
              ) : (
                <Plus size={18} />
              )}
              <span>{isSubmitting ? 'Creating...' : 'Create Product'}</span>
            </button>
          </form>

          {status && (
            <p className={`${styles.statusMessage} ${status.includes('fail') ? styles.statusError : styles.statusSuccess}`}>
              {status}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
