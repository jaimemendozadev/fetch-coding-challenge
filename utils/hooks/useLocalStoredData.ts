import { useEffect, useContext } from 'react';
import { StoreContext } from '../store';
import { UserShape, DogDetails } from '../ts';

interface StoreUpdate {
  user?: UserShape;
  dogMatch?: DogDetails;
  favorites?: Record<string, DogDetails>;
}

export const useLocalStoredData = () => {
  const { store, updateStore } = useContext(StoreContext);

  useEffect(() => {
    if (!store.user || !updateStore || typeof window === 'undefined') return;

    const storageKeys: Record<keyof StoreUpdate, string> = {
      user: 'user',
      favorites: 'favorites',
      dogMatch: 'dogMatch'
    };

    const update: StoreUpdate = Object.entries(storageKeys).reduce(
      (acc, [key, storageKey]) => {
        const item = localStorage.getItem(storageKey);
        if (item) acc[key as keyof StoreUpdate] = JSON.parse(item);
        return acc;
      },
      {} as StoreUpdate
    );

    if (Object.keys(update).length > 0) {
      updateStore((prev) => ({ ...prev, ...update }));
    }
  }, [store.user, updateStore]);
};
