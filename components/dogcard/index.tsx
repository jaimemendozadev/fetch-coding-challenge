'use client';
import { ReactNode } from 'react';
// import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardBody,
  Divider,
  CardFooter,
  Button,
  Image
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
    <Card className="w-[30%] mb-16">
      <CardHeader>
        <div>
          <p>Dog Name: {name}</p>
          <p>Age: {age}</p>
          <p>Breed: {breed}</p>
          {/* <p>Zip Code: {zip_code}</p> */}
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="p-6 ml-auto mr-auto border border-orange-800">
          <Image
            alt={`Picture of a ${breed} dog named ${name}`}
            src={img ? img : ''}
            className="w-[100%]"
          />
        </div>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-end">
        <Button
          className="bg-[#0098F3]"
          isIconOnly
          aria-label="Clear Search Form"
          onPress={() => console.log('FAVORITE DOG')}
        >
          <HeartIcon fill="pink" size={24} height={24} width={24} />
        </Button>
      </CardFooter>
    </Card>
  );
};
