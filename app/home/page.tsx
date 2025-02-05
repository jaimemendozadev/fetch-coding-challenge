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

  useEffect(() => {
    if (!store.user) {
      toast.error(
        'You have not registered. Please sign up/sign in to the app to proceed.',
        { duration: 3000 }
      );
      router.push('/');
    }
  }, [router, store.user]);

  const headerText = store?.user?.firstName ? `Welcome ${store.user.firstName} 🏡` : "Home Page 🏡";

  return (
    <div>
      <h1 className="text-6xl mb-12">{headerText}</h1>
      <SearchForm />
    </div>
  );
}
