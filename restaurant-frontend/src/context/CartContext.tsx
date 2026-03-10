'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order } from '../types';
import apiClient from '../api/client';
import { v4 as uuid } from 'uuid';

interface CartContextType {
  cart: Order | null;
  isLoading: boolean;
  addToCart: (productId: string, quantity: number, modifiers: Record<string, string[]>) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: () => Promise<string>; // Returns orderId
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; userId: string }> = ({ children, userId }) => {
  const [cart, setCart] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = async () => {
    try {
      const { data } = await apiClient.get<Order>(`/cart/${userId}`);
      setCart(data);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [userId]);

  const addToCart = async (productId: string, quantity: number, selectedModifiers: Record<string, string[]>) => {
    try {
      const { data } = await apiClient.post<Order>('/cart', {
        userId,
        item: { productId, quantity, selectedModifiers }
      });
      setCart(data);
    } catch (error) {
      console.error('Add to cart failed', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const { data } = await apiClient.put<Order>(`/cart/${userId}/item/${itemId}`, { quantity });
      setCart(data);
    } catch (error) {
      console.error('Update quantity failed', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await apiClient.delete(`/cart/${userId}/item/${itemId}`);
      // Refresh to get latest totals
      await refreshCart();
    } catch (error) {
      console.error('Remove item failed', error);
    }
  };

  const checkout = async () => {
    if (!cart) throw new Error('No cart found');
    
    // Idempotency: Use a unique key for this checkout session
    const idempotencyKey = uuid();
    
    try {
      const { data } = await apiClient.post<{ orderId: string }>('/orders', 
        { userId },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      
      // Clear local cart state
      setCart(null);
      return data.orderId;
    } catch (error) {
      console.error('Checkout failed', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ cart, isLoading, addToCart, updateQuantity, removeItem, checkout, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
