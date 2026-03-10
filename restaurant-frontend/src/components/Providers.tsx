'use client';

import React from 'react';
import { UserProvider, useUser } from '@/context/UserContext';
import { CartProvider } from '@/context/CartContext';

const ProvidersWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useUser();
  return (
    <CartProvider userId={userId}>
      {children}
    </CartProvider>
  );
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <UserProvider>
      <ProvidersWrapper>
        {children}
      </ProvidersWrapper>
    </UserProvider>
  );
};
