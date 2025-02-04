import { useEffect, useState, useContext } from 'react';
import { UserShape } from '@/utils/ts';
import { StoreContext } from '@/utils/store';

export const useGetUser = (): UserShape | undefined => {
  const { store } = useContext(StoreContext);
  const [storedUser, setStoredUser] = useState<UserShape | undefined>(
    undefined
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    const returnValue =
      storedUser === null ? undefined : JSON.parse(storedUser);

    if (store.user) {
        
      setStoredUser(store.user);
      
    } else if (returnValue !== null) {

      setStoredUser(returnValue);
    }
  }, [store.user]);

  return storedUser;
};
