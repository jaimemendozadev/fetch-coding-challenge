'use client';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { StoreContext } from '@/utils/store';
import { DogDetails } from '@/utils/ts';
import { Card, CardHeader, CardBody, Image, Divider } from '@heroui/react';

export const CurrentDogMatch = (): ReactNode => {
  const { store } = useContext(StoreContext);
  const [localDogMatch, updateLocalDogMatch] = useState<DogDetails | null>(
    null
  );

  const { dogMatch } = store;

  useEffect(() => {
    if (dogMatch !== null && dogMatch !== undefined) {
      updateLocalDogMatch(dogMatch);
    }
  }, [dogMatch]);

  if (localDogMatch === null) return null;

  const { name, age, breed, img } = localDogMatch;

  return (
    <Card className="w-[400px] h-[500px]">
      <CardHeader>
        <div className="p-4">
          <h2 className="text-xl mb-4">Your Current Dog Match 💗</h2>

          <p className="text-xl">
            <b>Dog Name</b>: {name}
          </p>
          <p className="text-xl">
            <b>Age</b>: {age}
          </p>
          <p className="text-xl">
            <b>Breed</b>: {breed}
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="border border-yellow-500 flex justify-center items-center p-6">
        <div className="ml-auto mr-auto border border-orange-800">
          <Image
            alt={`Picture of a ${breed} dog named ${name}`}
            src={img ? img : ''}
            className="w-full max-h-[250px] object-cover"
          />
        </div>
      </CardBody>

      <Divider />
    </Card>
  );
};
