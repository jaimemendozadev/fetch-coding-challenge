'use client';
import { useState, useContext, ReactNode } from 'react';
import { Input, Form, Button } from '@heroui/react';
import { BreedDropdown } from './breeddropdown';

export const SearchForm = () => {
  const [zipArray, updateZipArray] = useState<number[]>([]);
  const [ageRange, updateAgeRange] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });

  return (
    <Form className="max-w-[80%] m-auto flex flex-row justify-around items-center space-x-4 border border-orange-800">
      <Input
        className="w-[20%]"
        label="Zip Code"
        placeholder="Zip Codes (separated by comma)"
        type="text"
      />
      <Input
        className="w-[20%]"
        label="Min Age"
        placeholder="Enter a Minimum Dog Age"
        type="text"
      />
      <Input
        className="w-[20%]"
        label="Max Age"
        placeholder="Enter a Maximum Dog Age"
        type="text"
      />
      <BreedDropdown />
    </Form>
  );
};
