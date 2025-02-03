'use client';
import { createContext, ReactNode, useContext, useState } from 'react';

interface StoreShape {
  user?: {
    email: string;
    firstName: string;
    lastName: string;
  };

  pagination?: {
    size: number;
    page: number;
    total_pages: number;
    total: number;
  };

  results?: [{ [key: string]: any }];

  favorites?: [{ [key: string]: any }];
}

const StoreContext = createContext<StoreShape | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({
  children
}: StoreProviderProps): ReactNode {
  const [store, updateStore] = useState<StoreShape | undefined>(undefined);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}
