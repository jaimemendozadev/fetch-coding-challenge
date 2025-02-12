'use client';
import { ReactNode, useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import toast from 'react-hot-toast';
import { StoreContext } from '@/utils/store';
import { DogDetails, DogMatch, HTTP_METHODS, SubmitEvent } from '@/utils/ts';
import { FavoritesPanel } from '@/components/favoritespanel';
import { Navigation } from '@/components/navigation';
import { makeBackEndRequest, BASE_URL } from '@/utils';

const BASE_MATCH_URL = `${BASE_URL}/dogs/match`;

export default function FavoritesPage(): ReactNode {
  const { store, updateStore } = useContext(StoreContext);
  const router = useRouter();
  const [loadStatus, updateLoadStatus] = useState(true);
  const [inFlight, updateFlightStatus] = useState(false);
  const [loadedFaves, updateLoadedFaves] = useState<DogDetails[]>([]);

  const { favorites, dogMatch } = store;

  console.log('user in favorites 💗 ', store?.user);
  console.log('\n');

  console.log('store in favorites 💗 ', store);
  console.log('\n');

  const getUserDogMatching = async (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    if (
      !favorites ||
      !updateStore ||
      Object.keys(favorites).length === 0 ||
      inFlight
    )
      return;

    const errorMsg =
      'Sorry but there was a problem matching you with a dog. 😔 Try again later.';

    try {
      updateFlightStatus(true);

      const dogIDs = Object.keys(favorites);

      const method: HTTP_METHODS = 'POST';

      const payload = {
        apiURL: BASE_MATCH_URL,
        method,
        bodyPayload: dogIDs
      };

      // 🔹 Get the dogIDs from the searchURL
      const res = await makeBackEndRequest<DogMatch>(payload, true);

      console.log('res for getUserDogMatch ', res);
      console.log('\n');

      if ('match' in res) {
        const { match } = res;
        const pluckedMatch = favorites[match];

        if (pluckedMatch) {
          updateStore((prev) => ({ ...prev, ...{ dogMatch: pluckedMatch } }));
        }
      }

      toast.error(errorMsg, { duration: 3000 });
    } catch (error) {
      // TODO: Handle in telemetry.

      console.log('Error in getUserDogMatching in FavoritesPage: ', error);
      console.log('\n');

      toast.error(
        "🥺 It's not you, but there was a problem getting your dog match. Try again later.",
        { duration: 3000 }
      );
    }

    updateFlightStatus(false);
  };

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

      <div>
        <div className="border border-red-500 w-[45%]">
          <aside className="mb-8">
            <p className="text-xl">Here are all the cute dogs you favorited.</p>
            <p className="text-xl">
              Can&lsquo;t decide which dog you should be matched up with for
              adoption? 🤔
            </p>
            <p className="text-xl">
              Go ahead and click on the &#39;Get Matched&#39; button.
            </p>
            <p className="text-xl">
              Our service in the ☁️ cloud will take your dog picks and make a
              decision for you.
            </p>
            <p className="text-xl">No fuss, no muss.</p>
          </aside>
          <form onSubmit={getUserDogMatching} className="mb-36">
            <Button
              disabled={inFlight}
              className="bg-[#0098F3] text-white self-center"
              type="submit"
            >
              Get Matched
            </Button>
          </form>
        </div>
      </div>

      <FavoritesPanel
        data={loadedFaves}
        loading={loadStatus}
        favorites={favorites}
        toggleDogFavoriting={toggleDogFavoriting}
      />
    </div>
  );
}
