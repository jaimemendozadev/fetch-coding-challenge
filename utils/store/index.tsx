'use client';
import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction
} from 'react';

interface StoreShape {
  user?: {
    email: string;
    firstName: string;
    lastName: string;
    refreshTimer: number;
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

interface StoreContextShape {
  store: StoreShape;
  updateStore?: Dispatch<SetStateAction<StoreShape>>;
}

export const StoreContext = createContext<StoreContextShape>({ store: {} });

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({
  children
}: StoreProviderProps): ReactNode {
  const [store, updateStore] = useState<StoreShape>({});

  return (
    <StoreContext.Provider value={{ store, updateStore }}>
      {children}
    </StoreContext.Provider>
  );
}
