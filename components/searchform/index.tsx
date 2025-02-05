'use client';
import { useState, ReactNode } from 'react';
import { Input, Form } from '@heroui/react';
import { BreedDropdown } from './breeddropdown';
import { InputEvent } from '@/utils/ts';

interface FormState {
  minAge: string;
  maxAge: string;
  zipCodes: string;
}

export const SearchForm = (): ReactNode => {
  const [formState, updateFormState] = useState<FormState>({
    minAge: '',
    maxAge: '',
    zipCodes: ''
  });

  const handleChange = (evt: InputEvent): void => {
    const { id } = evt.target;

    const update = { [id]: evt.target.value.trim() };

    updateFormState((prev) => ({ ...prev, ...update }));
  };

  return (
    <Form className="max-w-[80%] p-6 mx-auto flex flex-row justify-around items-center space-x-4 border-2 border-[#DF2A87] rounded-md">
      <Input
        id="zipCodes"
        className="w-[20%]"
        label="Zip Code"
        placeholder="Zip Codes (separated by comma)"
        type="text"
        value={formState.zipCodes}
        onChange={handleChange}
      />
      <Input
        id="minAge"
        className="w-[20%]"
        label="Min Age"
        placeholder="Enter a Minimum Dog Age"
        type="text"
        value={formState.minAge}
        onChange={handleChange}
      />
      <Input
        id="maxAge"
        className="w-[20%]"
        label="Max Age"
        placeholder="Enter a Maximum Dog Age"
        type="text"
        value={formState.maxAge}
        onChange={handleChange}
      />
      <BreedDropdown />
    </Form>
  );
};
