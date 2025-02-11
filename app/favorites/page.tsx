'use client';
import { ReactNode, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { StoreContext } from '@/utils/store';
import { DogCard } from '@/components/dogcard';

export default function FavoritesPage(): ReactNode {
  const { store } = useContext(StoreContext);
  const router = useRouter();

  const { favorites } = store;

  console.log('user in favorites 💗 ', store?.user);
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

  return (
    <div className="p-8">
      <h1 className="text-6xl mb-14">Your Dog Favorites 💗</h1>

      <div className="max-w-[80%] flex flex-wrap justify-between border border-gray-900 mr-auto ml-auto">
        {favorites?.map((dogDetails) => (
          <DogCard
            key={dogDetails.id}
            favoriteHandler={addDogToFavorites}
            {...dogDetails}
          />
        ))}
      </div>
    </div>
  );
}
