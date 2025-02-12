import { useEffect, useContext } from 'react';
import { StoreContext } from '../store';
import { UserShape, DogDetails } from '../ts';

interface StoreUpdate {
  user?: UserShape;
  dogMatch?: DogDetails;
  favorites?: Record<string, DogDetails>;
}

export const useLocalStorageSync = () => {
  const { store, updateStore } = useContext(StoreContext);

  useEffect(() => {
    if (!updateStore || typeof window === 'undefined') return;

    const storageKeys: Record<keyof StoreUpdate, string> = {
      user: 'user',
      favorites: 'favorites',
      dogMatch: 'dogMatch'
    };

    const missingKeys = Object.keys(storageKeys).filter(
      (key) => !store[key as keyof StoreUpdate]
    );

    if (missingKeys.length === 0) return;

    const update: StoreUpdate = missingKeys.reduce((acc, key) => {
      const item = localStorage.getItem(storageKeys[key as keyof StoreUpdate]);
      if (item) acc[key as keyof StoreUpdate] = JSON.parse(item);
      return acc;
    }, {} as StoreUpdate);

    if (Object.keys(update).length > 0) {
      updateStore((prev) => ({ ...prev, ...update }));
    }
  }, [store, updateStore]);
};
