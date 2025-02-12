'use client';
import { ReactNode, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { StoreContext } from '@/utils/store';
import { SearchForm } from '@/components/searchform';
import { Navigation } from '@/components/navigation';
import { useLocalStorageSync } from '@/utils/hooks/useLocalStorageSync';

export default function HomePage(): ReactNode {
  useLocalStorageSync();
  const { store } = useContext(StoreContext);
  const router = useRouter();

  console.log('user in HomePage 🏡 ', store?.user);
  console.log('\n');

  const handleSearchRedirect = (frontendURL: string) => {
    router.push(frontendURL);
  };

  useEffect(() => {
    if (!store.user) {
      toast.error(
        'You have not registered. Please sign up/sign in to the app to proceed.',
        { duration: 3000 }
      );
      router.push('/');
    }
  }, [router, store.user]);

  return (
    <div className="p-8">
      <Navigation />
      <h1 className="text-6xl mb-14">Home Page 🏡</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
    </div>
  );
}
