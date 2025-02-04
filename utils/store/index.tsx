'use client';
import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction
} from 'react';
import { UserShape } from '@/utils/ts';

interface StoreShape {
  user?: UserShape;
  pagination?: {
    size: number;
    page: number;
    total_pages: number;
    total: number;
  };

  results?: { [key: string]: any };

  favorites?: { [key: string]: any };
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
  const [store, updateStore] = useState<StoreShape>(() => {
    const storedUserInfo = localStorage.getItem('user');

    const initStore =
      storedUserInfo !== null ? { user: JSON.parse(storedUserInfo) } : {};

    return initStore;
  });

  return (
    <StoreContext.Provider value={{ store, updateStore }}>
      {children}
    </StoreContext.Provider>
  );
}
