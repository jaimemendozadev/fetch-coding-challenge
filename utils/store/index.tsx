'use client';
import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction
} from 'react';
import {
  UserShape,
  SearchShape,
  PaginationShape,
  DogDetails
} from '@/utils/ts';

export const DEFAULT_RESULT_SIZE = 25;

export interface StoreShape {
  user?: UserShape;
  pagination?: PaginationShape;

  results?: DogDetails[];

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

export const createInitStore = (): StoreShape => {
  return {
    search: {
      ageMin: '',
      ageMax: '',
      zipCodes: [],
      breeds: new Set([]),
      sort: new Set([]),
      size: DEFAULT_RESULT_SIZE
    },
    pagination: {
      from: 0,
      page: 1,
      total_pages: 0,
      total: 0
    },
    results: []
  };
};

export default function StoreProvider({
  children
}: StoreProviderProps): ReactNode {
  const [store, updateStore] = useState<StoreShape>(() => {
    let storedUserInfo: string | null = null;

    if (typeof window !== 'undefined') {
      storedUserInfo = localStorage.getItem('user');
    }

    const initStore = createInitStore();

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
