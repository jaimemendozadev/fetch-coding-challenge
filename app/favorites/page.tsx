'use client';
import { ReactNode, useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { StoreContext } from '@/utils/store';
import { DogDetails } from '@/utils/ts';
import { FavoritesPanel } from '@/components/favoritespanel';
import { Navigation } from '@/components/navigation';

export default function FavoritesPage(): ReactNode {
  const { store, updateStore } = useContext(StoreContext);
  const router = useRouter();
  const [loadStatus, updateLoadStatus] = useState(true);
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

    let favoriteLookup: Record<string, DogDetails> = {};
    if (typeof window !== 'undefined') {
      const storedFavorites = localStorage.getItem('favorites');
      favoriteLookup = storedFavorites ? JSON.parse(storedFavorites) : {};
    }

    if (!favorites || !updateStore) return;

    const isFavorited = id in favorites;
    const updatedFavorites = { ...favorites };

    if (isFavorited) {
      delete updatedFavorites[id];
      delete favoriteLookup[id];
    } else {
      updatedFavorites[id] = dogDetails;
      favoriteLookup[id] = dogDetails;
    }

    updateStore((prev) => ({ ...prev, favorites: updatedFavorites }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(favoriteLookup));
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
    const fetchFavorites = () => {
      if (store.favorites) {
        return Object.values(store.favorites);
      }

      if (typeof window !== 'undefined') {
        const storedFaves = localStorage.getItem('favorites');
        if (storedFaves) {
          return Object.values(JSON.parse(storedFaves)) as DogDetails[];
        }
      }

      return [];
    };

    updateLoadedFaves(fetchFavorites());
    updateLoadStatus(false);
  }, [store.favorites]);

  return (
    <div className="p-8">
      <Navigation />
      <h1 className="text-6xl mb-20">Your Dog Favorites 💗</h1>

      <FavoritesPanel
        data={loadedFaves}
        loading={loadStatus}
        favorites={favorites}
        toggleDogFavoriting={toggleDogFavoriting}
      />
    </div>
  );
}
