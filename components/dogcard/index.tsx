'use client';
import { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  CardFooter,
  Button,
  Image,
  Tooltip
} from '@heroui/react';
import { HeartIcon } from './hearticon';
import { DogDetails } from '@/utils/ts';

interface DogCardProps {
  favoriteHandler: (dogDetails: DogDetails) => void;
  isFavorited: boolean;
  dogPayload: DogDetails;
}

export const DogCard = (dogDetails: DogCardProps): ReactNode => {
  const { dogPayload, isFavorited, favoriteHandler } = dogDetails;

  const { name, age, breed, zip_code, img } = dogPayload;

  return (
    <Card className="w-[30%] mb-16">
      <CardHeader>
        <div className="p-4">
          <p>
            <b>Dog Name</b>: {name}
          </p>
          <p>
            <b>Age</b>: {age}
          </p>
          <p>
            <b>Breed</b>: {breed}
          </p>
          <p>
            <b>Zip Code</b>: {zip_code}
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="flex justify-center items-center p-6">
        <div className="ml-auto mr-auto">
          <Image
            alt={`Picture of a ${breed} dog named ${name}`}
            src={img ? img : ''}
            className="w-[100%]"
          />
        </div>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-end">
        <Tooltip
          content={isFavorited ? 'Unfavorite this dog' : 'Favorite this dog'}
        >
          <Button
            className="bg-white border-small border-black"
            isIconOnly
            aria-label="Clear Search Form"
            onPress={() => favoriteHandler(dogPayload)}
          >
            <HeartIcon
              fill={isFavorited ? 'red' : 'none'}
              stroke="red"
              size={24}
              height={24}
              width={24}
            />
          </Button>
        </Tooltip>
      </CardFooter>
    </Card>
  );
};
