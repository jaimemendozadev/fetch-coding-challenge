import { useEffect, useState, useContext } from 'react';
import { UserShape } from '@/utils/ts';
import { StoreContext } from '@/utils/store';

export const useGetUser = (): UserShape | undefined => {
  const { store, updateStore } = useContext(StoreContext);
  const [storedUser, setStoredUser] = useState<UserShape | undefined>(
    undefined
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    const returnValue: null | UserShape =
      storedUser === null ? undefined : JSON.parse(storedUser);

    if (store.user) {
      setStoredUser(store.user);
    } else if (returnValue !== null) {
      setStoredUser(returnValue);
      if (updateStore) {
        updateStore((prev) => ({ ...prev, ...{ user: returnValue } }));
      }
    }
  }, [store.user, updateStore]);

  return storedUser;
};
