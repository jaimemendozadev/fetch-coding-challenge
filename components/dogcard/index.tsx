'use client';
import { ReactNode } from 'react';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  CardFooter,
  Button
} from '@heroui/react';
import { HeartIcon } from './hearticon';
import { DogDetails } from '@/utils/ts';

export const DogCard = ({
  age,
  breed,
  img,
  name,
  zip_code
}: DogDetails): ReactNode => {
  return (
    <Card>
      <CardHeader>
        <p>{name}</p>

        <Button
          className="bg-[#0098F3]"
          isIconOnly
          aria-label="Clear Search Form"
          onPress={() => console.log('FAVORITE DOG')}
        >
          <HeartIcon fill="pink" size={24} height={24} width={24} />
        </Button>
      </CardHeader>
      <Divider />
      <CardBody>
        <Image
          alt={`Picture of a ${breed} dog named ${name}`}
          src={img ? img : ''}
        />
      </CardBody>

      <Divider />

      <CardFooter>
        <p>Age: {age}</p>
        <p>Breed: {breed}</p>
        <p>Zip Code: {zip_code}</p>
      </CardFooter>
    </Card>
  );
};
