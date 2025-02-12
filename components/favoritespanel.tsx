'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { Spinner } from '@heroui/react';
import { DogDetails } from '@/utils/ts';
import { DogCard } from './dogcard';

interface FavoritesPanelProps {
  data: DogDetails[];
  loading: boolean;
  favorites?: { [key: string]: DogDetails };
  toggleDogFavoriting: (dogDetails: DogDetails) => void;
}

const NoFavoritesFeedback = () => (
  <div>
    <p className="text-3xl mb-4">
      Looks like you have not favorited any dogs. 😞
    </p>
    <p className="text-3xl mb-4">
      Please go to the{' '}
      <Link
        className="text-[#003366] underline decoration-1 underline-offset-4"
        href="/home"
      >
        Home Page
      </Link>{' '}
      or{' '}
      <Link
        className="text-[#003366] underline decoration-1 underline-offset-4"
        href="/search"
      >
        Search Page
      </Link>{' '}
      to search for and favorite some dogs.
    </p>

    <p className="text-3xl mb-4">
      Once you do, you can get matched with a dog or update your current match.
      🐶
    </p>
  </div>
);

export const FavoritesPanel = ({
  data,
  loading,
  favorites,
  toggleDogFavoriting
}: FavoritesPanelProps): ReactNode => {
  console.log('data in FavoritesPanel ', data);
  console.log('\n');

  if (loading) {
    return (
      <div className="max-w-[80%] mr-auto ml-auto flex justify-center">
        <Spinner />
      </div>
    );
  }
  return (
    <div className="max-w-[80%] flex flex-wrap justify-evenly border border-gray-900 mr-auto ml-auto">
      {data.length === 0 ? (
        <NoFavoritesFeedback />
      ) : (
        data.map((dogDetails) => {
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
  );
};
