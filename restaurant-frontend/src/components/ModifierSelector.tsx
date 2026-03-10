'use client';

import React, { useState } from 'react';
import { Product, ModifierGroup } from '../types';
import { X, Check } from 'lucide-react';
import styles from './ModifierSelector.module.css';

interface ModifierSelectorProps {
  product: Product;
  onConfirm: (selectedModifiers: Record<string, string[]>) => void;
  onCancel: () => void;
}

const ModifierSelector: React.FC<ModifierSelectorProps> = ({ product, onConfirm, onCancel }) => {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (mod: ModifierGroup, option: string) => {
    const currentSelections = selections[mod.id] || [];
    const isSelected = currentSelections.includes(option);

    let newSelections: string[];

    if (mod.maxSelect === 1) {
      newSelections = isSelected ? [] : [option];
    } else {
      if (isSelected) {
        newSelections = currentSelections.filter(item => item !== option);
      } else {
        if (currentSelections.length >= mod.maxSelect) {
          setError(`You can only select up to ${mod.maxSelect} ${mod.name}`);
          return;
        }
        newSelections = [...currentSelections, option];
      }
    }

    setSelections(prev => ({ ...prev, [mod.id]: newSelections }));
    setError(null);
  };

  const validateAndConfirm = () => {
    for (const mod of product.modifiers) {
      const groupSelections = selections[mod.id] || [];
      if (mod.required && groupSelections.length === 0) {
        setError(`${mod.name} is required`);
        return;
      }
    }
    onConfirm(selections);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{product.name}</h2>
            <p className={styles.subtitle}>Customize your selection</p>
          </div>
          <button onClick={onCancel} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={`${styles.body} ${styles.customScrollbar}`}>
          {product.modifiers.map((mod) => (
            <div key={mod.id} className={styles.group}>
              <div className={styles.groupHeader}>
                <div className={styles.groupTitle}>
                  <span>{mod.name}</span>
                  {mod.required && <span className={styles.requiredBadge}>Required</span>}
                </div>
                <span className={styles.groupInfo}>
                  {mod.maxSelect > 1 ? `Select up to ${mod.maxSelect}` : 'Select one'}
                </span>
              </div>
              
              <div className={styles.optionsGrid}>
                {mod.options.map((option) => {
                  const isSelected = (selections[mod.id] || []).includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelect(mod, option)}
                      className={`${styles.optionButton} ${isSelected ? styles.optionActive : ''}`}
                    >
                      <span>{option}</span>
                      <div className={`${styles.checkbox} ${isSelected ? styles.checkboxActive : ''}`}>
                        {isSelected && <Check size={12} color="#000" strokeWidth={4} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          {error && <div className={styles.errorBox}>{error}</div>}
          
          <div className={styles.footerButtons}>
            <button onClick={onCancel} className={styles.cancelBtn}>
              CANCEL
            </button>
            <button onClick={validateAndConfirm} className="btn-premium" style={{ flex: 2 }}>
              CONFIRM SELECTION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifierSelector;
