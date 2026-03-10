'use client';

import React, { createContext, useContext, useState } from 'react';

interface UserContextType {
  userId: string;
  userName: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mock User for the assignment
  const [user] = useState<UserContextType>({
    userId: 'user_123',
    userName: 'Jane Doe'
  });

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
