'use client';
import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction
} from 'react';
import { UserShape, SearchShape } from '@/utils/ts';

export const DEFAULT_SORT = 'breed:asc';
export const DEFAULT_RESULT_SIZE = 25;

export interface StoreShape {
  user?: UserShape;
  pagination?: {
    size: number;
    page: number;
    total_pages: number;
    total: number;
  };

  results?: { [key: string]: any };

  favorites?: { [key: string]: any };

  search?: SearchShape;
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
    let storedUserInfo: string | null = null;

    if (typeof window !== 'undefined') {
      storedUserInfo = localStorage.getItem('user');
    }

    const initStore: StoreShape = {
      search: {
        ageMin: '',
        ageMax: '',
        zipCodes: '',
        breeds: new Set([]),
        sort: DEFAULT_SORT,
        size: DEFAULT_RESULT_SIZE
      }
    };

    if (storedUserInfo !== null) {
      initStore['user'] = JSON.parse(storedUserInfo);
    }

    return initStore;
  });

  return (
    <StoreContext.Provider value={{ store, updateStore }}>
      {children}
    </StoreContext.Provider>
  );
}
