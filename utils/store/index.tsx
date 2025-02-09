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
        sort: new Set([]),
        size: DEFAULT_RESULT_SIZE
      },
      pagination: {
        from: 0,
        page: 1,
        total_pages: 0,
        total: 0
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

/******************************************** 
   * Notes
   ******************************************** 
   
   - When making the initial request, we never specify the 'from' query parameter.

   - If we make an initial successful request for dogIDs, we get the 'from' query parameter of the starting
     record index for the next search.

     So for the first time for Page 1, since we request a 'size' of 25, the 'from' for the next set of records
     is 25.

     Page 2
      next is 50

     Page 3
       next is 75


    If we're on Page 1 and wanted to go to Page 3, update Store Pagination with

    Current Pagination State:
    {
      page: 1,
      next: 25
    }

    Update for Pagination State:

    distance = Math.abs(targetPage - currentPage)
    tagetIndex = distance * size
    {
      page: 3,
      from: targetIndex
    }


  */
