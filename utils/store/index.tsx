'use client';
import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction
} from 'react';
import { UserShape, SearchShape } from '@/utils/ts';

/*
onst ageMin = queryParams.get('ageMin');
  const ageMax = queryParams.get('ageMax');
  const zipCodes = queryParams.get('zipCodes');
  const breeds = queryParams.get('breeds');
*/

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
        minAge: '',
        maxAge: '',
        zipCodes: '',
        breeds: new Set([])
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
