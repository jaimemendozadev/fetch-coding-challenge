'use client';
import { ReactNode, useEffect, useContext, useState } from 'react';
import { Spinner } from '@heroui/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { createInitStore, StoreContext } from '@/utils/store';
import { useLocalStorageSync } from '@/utils/hooks/useLocalStorageSync';
import { makeBackEndRequest, BASE_URL } from '@/utils';
import { HTTP_METHODS } from '@/utils/ts';

export default function LogoutPage(): ReactNode {
  useLocalStorageSync();
  const { store, updateStore } = useContext(StoreContext);
  const router = useRouter();

  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  useEffect(() => {
    if (hasLoggedOut || !store.user || !updateStore) return;

    const logoutOfApp = async () => {
      const logoutURL = `${BASE_URL}/auth/logout`;

      if (typeof window !== 'undefined' && store.user) {
        localStorage.clear();

        const { firstName, lastName, email } = store.user;
        const name = `${firstName} ${lastName}`;
        const storeReset = createInitStore();

        updateStore(storeReset);

        const reqPayload = {
          apiURL: logoutURL,
          method: 'POST' as HTTP_METHODS,
          bodyPayload: { name, email }
        };

        await makeBackEndRequest<Response>(reqPayload, false);

        toast.success("You've been logged out. See you later. 👋🏼", {
          duration: 3000
        });

        setHasLoggedOut(true);

        setTimeout(() => router.push('/'), 3000);
      }
    };

    logoutOfApp();
  }, [router, store.user, updateStore, hasLoggedOut]);

  return (
    <div className="w-[100%] min-h-screen flex justify-center items-center">
      <Spinner />
    </div>
  );
}
