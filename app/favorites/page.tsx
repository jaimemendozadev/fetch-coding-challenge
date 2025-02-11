'use client';
import { ReactNode, useEffect, useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { StoreContext } from '@/utils/store';
import { DogCard } from '@/components/dogcard';
import { DogDetails } from '@/utils/ts';

const NoFavoritesFeedback = () => (
  <>
    <p className="text-3xl">Looks like you have not favorited any dogs.</p>
    <p className="text-3xl">
      Please go to the <Link href="/">Home Page</Link> or{' '}
      <Link href="/search">Search Page</Link> to search for and favorite some
      dogs. 🐶
    </p>
  </>
);

export default function FavoritesPage(): ReactNode {
  const { store, updateStore } = useContext(StoreContext);
  const router = useRouter();
  const [loadedFaves, updateLoadedFaves] = useState<DogDetails[]>([]);

  const { favorites } = store;

  console.log('user in favorites 💗 ', store?.user);
  console.log('\n');

  const toggleDogFavoriting = (dogDetails: DogDetails): void => {
    if (!dogDetails) {
      toast.error(
        "We can't favorite your dog selection right now. 🥺 Try again later.",
        { duration: 3000 }
      );
      return;
    }

    const { favorites } = store;

    const { id } = dogDetails;

    if (favorites && updateStore && typeof window !== 'undefined') {
      const favoritesLookup = localStorage.getItem('favorites');

      const storedFavorites: { [key: string]: DogDetails } =
        favoritesLookup === null ? {} : JSON.parse(favoritesLookup);

      if (favorites[id] === undefined) {
        const update = { ...favorites };
        update[id] = dogDetails;

        storedFavorites[id] = dogDetails; // Really not too worried about overwriting localStorage copy.

        updateStore((prev) => ({ ...prev, ...{ favorites: update } }));
        localStorage.setItem('favorites', JSON.stringify(storedFavorites));
        return;
      }

      const deletedUpdate = { ...favorites };

      delete deletedUpdate[id];
      delete storedFavorites[id];

      updateStore((prev) => ({ ...prev, ...{ favorites: deletedUpdate } }));

      localStorage.setItem('favorites', JSON.stringify(storedFavorites));
    }
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

  useEffect(() => {
    console.log('store.favorites ', store.favorites);
    console.log('\n');

    if (store.favorites) {
      const dogPayloads = Object.values(store.favorites);

      updateLoadedFaves(dogPayloads);
      return;
    } else {
      if (typeof window !== 'undefined') {
        const plucked = localStorage.getItem('favorites');

        console.log('plucked localStorage ', plucked);
        console.log('\n');

        if (plucked !== null) {
          const dogPayloads: DogDetails[] = Object.values(JSON.parse(plucked));

          console.log('parsed localStorage ', dogPayloads);
          console.log('\n');

          updateLoadedFaves(dogPayloads);
        }
      }
    }
  }, [store.favorites]);

  return (
    <div className="p-8">
      <h1 className="text-6xl mb-14">Your Dog Favorites 💗</h1>

      <div className="max-w-[80%] flex flex-wrap justify-between border border-gray-900 mr-auto ml-auto">
        {loadedFaves.length === 0 ? (
          <NoFavoritesFeedback />
        ) : (
          loadedFaves.map((dogDetails) => {
            let favoriteStatus = false;

            if (favorites && Object.hasOwn(favorites, dogDetails.id)) {
              favoriteStatus = true;
            }

            return (
              <DogCard
                key={dogDetails.id}
                isFavorited={favoriteStatus}
                favoriteHandler={toggleDogFavoriting}
                dogPayload={dogDetails}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
