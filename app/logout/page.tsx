'use client';
import { ReactNode, useEffect, useContext } from 'react';
import { Spinner } from '@heroui/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { createInitStore, StoreContext } from '@/utils/store';
import { useLocalStorageSync } from '@/utils/hooks/useLocalStorageSync';

export default function HomePage(): ReactNode {
  useLocalStorageSync();
  const { store, updateStore } = useContext(StoreContext);
  const router = useRouter();

  console.log('store in logout ', store);
  console.log('\n');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();

      if (updateStore) {
        const storeReset = createInitStore();
        updateStore((prev) => ({ ...prev, ...storeReset }));

        toast.success("You've been logged out. See you later. 👋🏼", {
          duration: 3000
        });
        router.push('/');
      }
    }
  }, [router, updateStore]);

  return (
    <div className="w-[100%] min-h-screen flex justify-center items-center">
      <Spinner />
    </div>
  );
}
