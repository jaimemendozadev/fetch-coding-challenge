import { useEffect, useContext } from 'react';
import { StoreContext } from '../store';
import { UserShape } from '../ts';

export const useLocalStoredData = () => {
  const { store, updateStore } = useContext(StoreContext);

  useEffect(() => {
    if (!store.user || !updateStore || typeof window === undefined) return;

    let localStoredUser = null;
    localStoredUser = localStorage.getItem('user');

    if (localStoredUser !== null) {
      const parsedUser: UserShape = JSON.parse(localStoredUser);

      updateStore((prevState) => ({
        ...prevState,
        ...{ user: parsedUser }
      }));
    }
  }, [store.user, updateStore]);
};
