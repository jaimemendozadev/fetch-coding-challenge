'use client';
import { useState, ReactNode, useMemo, useContext } from 'react';
import toast from 'react-hot-toast';
import { Button, SharedSelection, Input, Form } from '@heroui/react';
import { ClearIcon } from './clearicon';
import { BreedDropdown } from './breeddropdown';
import { InputEvent, SubmitEvent } from '@/utils/ts';
import { DEFAULT_RESULT_SIZE, DEFAULT_SORT, StoreContext } from '@/utils/store';

interface SearchFormProps {
  submitCallback: (frontendURL: string) => void;
}

interface FormState {
  ageMin: string;
  ageMax: string;
  zipCodes: string;
  sort: string;
  size: number;
}

export const SearchForm = ({ submitCallback }: SearchFormProps): ReactNode => {
  const { store } = useContext(StoreContext);

  const [formState, updateFormState] = useState<FormState>(() => {
    const { search } = store;

    let baseState: FormState = {
      ageMin: '',
      ageMax: '',
      zipCodes: '',
      sort: DEFAULT_SORT,
      size: DEFAULT_RESULT_SIZE
    };

    if (search) {
      const { ageMin, ageMax, zipCodes, sort, size } = search;

      baseState = {
        ageMin,
        ageMax,
        zipCodes,
        sort: sort.length === 0 ? DEFAULT_SORT : sort,
        size: size ? size : DEFAULT_RESULT_SIZE
      };
    }

    return baseState;
  });

  const [selectedBreeds, updateSelectedBreeds] = useState<SharedSelection>(
    () => {
      const { search } = store;

      if (search) {
        return search.breeds;
      }

      return new Set([]);
    }
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

    const { ageMin, ageMax, zipCodes, sort, size } = formState;

    let frontendURL = `/search?sort=${sort}&size=${size}`;

    if (ageMin.length) {
      const minCheck = Number.parseInt(ageMin, 10);

      if (Number.isNaN(minCheck)) {
        toast.error('Please enter a valid minimum age.');
        return;
      } else {
        frontendURL = `${frontendURL}&ageMin=${minCheck}`;
      }
    }

    if (ageMax.length) {
      const maxCheck = Number.parseInt(ageMax, 10);

      if (Number.isNaN(maxCheck)) {
        toast.error('Please enter a valid maxim age.');
        return;
      } else {
        frontendURL = `${frontendURL}&ageMax=${maxCheck}`;
      }
    }

    let convertedCodes: number[] = [];

    const parsedZipCodes = zipCodes.match(/\b\d{5}\b/g);

    if (parsedZipCodes === null && zipCodes.length > 0) {
      toast.error('Please enter valid 5 digit zip codes.');
      return;
    }

    if (parsedZipCodes !== null) {
      convertedCodes = parsedZipCodes.map((codeString) =>
        Number.parseInt(codeString, 10)
      );

      frontendURL = `${frontendURL}&zipCodes=${convertedCodes}`;
    }

    const dogBreeds = Array.from(selectedBreeds);

    if (dogBreeds.length) {
      frontendURL = `${frontendURL}&breeds=${dogBreeds}`;
    }

    console.log('FINALIZED frontendURL ', frontendURL);
    console.log('\n');

    submitCallback(frontendURL);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="max-w-[80%] p-6 mx-auto flex flex-row justify-around items-center space-x-4 border-2 border-[#DF2A87] rounded-md"
    >
      <Input
        id="zipCodes"
        className="w-[15%] font-bold"
        label="Zip Code"
        placeholder="Zip Codes, comma sepparated"
        type="text"
        value={formState.zipCodes}
        onChange={handleChange}
      />
      <Input
        id="ageMin"
        className="w-[15%] font-bold"
        label="Min Age"
        placeholder="Enter a Minimum Dog Age"
        type="text"
        value={formState.ageMin}
        onChange={handleChange}
      />
      <Input
        id="ageMax"
        className="w-[15%] font-bold"
        label="Max Age"
        placeholder="Enter a Maximum Dog Age"
        type="text"
        value={formState.ageMax}
        onChange={handleChange}
      />
      <BreedDropdown
        selectedBreeds={selectedBreeds}
        selectedValue={selectedValue}
        updateSelectedBreeds={updateSelectedBreeds}
      />
      <Button
        className="bg-[#0098F3]"
        isIconOnly
        aria-label="Clear Search Form"
      >
        <ClearIcon fill="black" size={24} height={24} width={24} />
      </Button>
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
      

  */

/*
    2-7-25 TODO: 
     - Need to add checkboxes or something to handle toggling between desc & asc sorting.
  
    ➕ Feature:   
      - Need to add an input field for result size.
  */
