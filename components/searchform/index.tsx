'use client';
import { useState, ReactNode, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  SharedSelection,
  Input,
  Form
} from '@heroui/react';
import { DOG_BREEDS } from '@/utils';
import { InputEvent, SubmitEvent } from '@/utils/ts';

interface FormState {
  minAge: string;
  maxAge: string;
  zipCodes: string;
}

interface SearchPayload {
  minAge?: number;
  maxAge?: number;
  zipCodes?: number[];
  breeds?: string[];
}

export const SearchForm = (): ReactNode => {
  const [formState, updateFormState] = useState<FormState>({
    minAge: '',
    maxAge: '',
    zipCodes: ''
  });

  const [selectedBreeds, updateSelectedBreeds] = useState<SharedSelection>(
    new Set()
  );

  // See Dev Note #1
  const selectedValue = useMemo(() => {
    const baseSelections = Array.from(selectedBreeds);

    if (baseSelections.length === 0) return 'Choose a Breed';

    const trimmedSelection = baseSelections.slice(0, 1).join(', ').trim();

    return baseSelections.length > 1
      ? `${trimmedSelection}...`
      : trimmedSelection;
  }, [selectedBreeds]);

  const handleChange = (evt: InputEvent): void => {
    const { id } = evt.target;

    const update = { [id]: evt.target.value };

    updateFormState((prev) => ({ ...prev, ...update }));
  };

  const handleSubmit = async (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    const { minAge, maxAge, zipCodes } = formState;

    const payload: SearchPayload = {};

    if (minAge.length) {
      const minCheck = Number.parseInt(minAge, 10);

      if (Number.isNaN(minCheck)) {
        toast.error('Please enter a valid minimum age.');
        return;
      } else {
        payload.minAge = minCheck;
      }
    }

    if (maxAge.length) {
      const maxCheck = Number.parseInt(maxAge, 10);

      if (Number.isNaN(maxCheck)) {
        toast.error('Please enter a valid maxim age.');
        return;
      } else {
        payload.maxAge = maxCheck;
      }
    }

    const dogBreeds = Array.from(selectedBreeds);

    const parsedZipCodes = zipCodes.match(/\bhello\b/g);
    const convertedCodes =
      parsedZipCodes === null
        ? []
        : parsedZipCodes.map((codeString) => Number.parseInt(codeString, 10));

    console.log('dogBreeds in submit ', dogBreeds);
    console.log('\n');

    console.log('parsedZipCodes in submit ', parsedZipCodes);
    console.log('\n');

    console.log('convertedCodes ', convertedCodes);
    console.log('\n');
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="max-w-[80%] p-6 mx-auto flex flex-row justify-around items-center space-x-4 border-2 border-[#DF2A87] rounded-md"
    >
      <Input
        id="zipCodes"
        className="w-[20%] font-bold"
        label="Zip Code"
        placeholder="Zip Codes (separated by comma)"
        type="text"
        value={formState.zipCodes}
        onChange={handleChange}
      />
      <Input
        id="minAge"
        className="w-[20%] font-bold"
        label="Min Age"
        placeholder="Enter a Minimum Dog Age"
        type="text"
        value={formState.minAge}
        onChange={handleChange}
      />
      <Input
        id="maxAge"
        className="w-[20%] font-bold"
        label="Max Age"
        placeholder="Enter a Maximum Dog Age"
        type="text"
        value={formState.maxAge}
        onChange={handleChange}
      />
      <Dropdown>
        <DropdownTrigger>
          <Button className="capitalize" variant="bordered">
            {selectedValue}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          className="max-h-[50vh] overflow-y-scroll" // See Dev Note #2
          aria-label="Multiple Dog Breed Dropdown"
          closeOnSelect={false}
          selectedKeys={selectedBreeds}
          selectionMode="multiple"
          variant="flat"
          onSelectionChange={updateSelectedBreeds}
        >
          {DOG_BREEDS.map((breedType) => (
            <DropdownItem key={breedType}>{breedType}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>

      <Button className="bg-[#0098F3] font-bold" type="submit">
        Search
      </Button>
    </Form>
  );
};

/******************************************** 
   * Notes
   ******************************************** 

   1) Had to cut off the selected breeds in the <Button> selectedValue
      because it was breaking the layout. For now, this solution
      will have to do.

      We're also handling the default "Choose a Breed" default label
      in a hacky way because the <DropdownMenu /> emptyContent prop
      doesn't work.
   
   2) DropdownMenu clips DropdownItems if more the 80+.
      Found solution at: https://github.com/heroui-inc/heroui/issues/3244#issuecomment-2173189338

  */
