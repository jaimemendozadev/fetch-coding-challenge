import { useEffect, useState } from 'react';
import { UserShape } from '@/utils/ts';

export const useGetUser = (): UserShape | undefined => {
  const [storedUser, setStoredUser] = useState<UserShape | undefined>(
    undefined
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    const returnValue =
      storedUser === null ? undefined : JSON.parse(storedUser);

    setStoredUser(returnValue);
  }, []);

  return storedUser;
};
