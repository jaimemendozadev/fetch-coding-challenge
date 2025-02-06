'use client';
import { ReactNode, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { StoreContext } from '@/utils/store';
import { SearchForm } from '@/components/searchform';

export default function HomePage(): ReactNode {
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
    <div>
      <h1 className="text-6xl mb-12">Home Page 🏡</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
    </div>
  );
}
