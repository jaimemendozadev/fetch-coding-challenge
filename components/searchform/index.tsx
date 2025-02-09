'use client';
import { useState, ReactNode, useMemo, useContext } from 'react';
import toast from 'react-hot-toast';
import { Button, SharedSelection, Input, Form } from '@heroui/react';
import { ClearIcon } from './clearicon';
import { BreedDropdown } from './breeddropdown';
import { DescendDropdown } from './descenddropdown';
import { InputEvent, SubmitEvent } from '@/utils/ts';
import { DEFAULT_RESULT_SIZE, StoreContext } from '@/utils/store';

interface SearchFormProps {
  submitCallback: (frontendURL: string) => void;
}

interface FormState {
  ageMin: string;
  ageMax: string;
  zipCodes: string;
  size: number;
}

export const DEFAULT_SORT = 'asc';
const DEFAULT_SORT_LABEL = 'Sort Results in';

export const SearchForm = ({ submitCallback }: SearchFormProps): ReactNode => {
  const { store, updateStore } = useContext(StoreContext);

  const [formState, updateFormState] = useState<FormState>(() => {
    const { search } = store;

    let baseState: FormState = {
      ageMin: '',
      ageMax: '',
      zipCodes: '',
      size: DEFAULT_RESULT_SIZE
    };

    if (search) {
      const { ageMin, ageMax, zipCodes, size } = search;

      baseState = {
        ageMin,
        ageMax,
        zipCodes,
        size: size ? size : DEFAULT_RESULT_SIZE
      };
    }

    return baseState;
  });

  const [selectedBreeds, updateSelectedBreeds] = useState<SharedSelection>(
    () => {
      const { search } = store;

      if (search && search.breeds) {
        return search.breeds;
      }

      return new Set([]);
    }
  );

  // See Dev Note #1
  const selectedBreedLabel = useMemo(() => {
    const baseSelections = Array.from(selectedBreeds);

    if (baseSelections.length === 0) return 'Choose a Breed';

    const trimmedSelection = baseSelections.slice(0, 1).join(', ').trim();

    return baseSelections.length > 1
      ? `${trimmedSelection}...`
      : trimmedSelection;
  }, [selectedBreeds]);

  const [selectedSortKeys, setSelectedSortKeys] = useState<SharedSelection>(
    () => {
      const { search } = store;

      if (search) {
        console.log('search.sort in sort SearchForm initializer ', search.sort);
        console.log('\n');
      }

      if (search && search.sort) {
        const directionCheck = new Set([...search.sort]);

        if (directionCheck.has('desc')) {
          console.log("returning directionCheck.has(desc')");
          console.log('\n');
          return new Set(['desc']);
        }

        if (directionCheck.has('asc')) {
          console.log("returning directionCheck.has(asc')");
          console.log('\n');
          return new Set(['asc']);
        }
      }

      return new Set([]);
    }
  );

  const selectedSortLabel = useMemo(() => {
    const sortSelection = Array.from(selectedSortKeys);

    console.log('sortSelection in SearchForm useMemo ', sortSelection);
    console.log('\n');

    if (sortSelection.length === 0) return DEFAULT_SORT_LABEL;

    return sortSelection.join('');
  }, [selectedSortKeys]);

  console.log('selectedSortLabel in SearchForm', selectedSortLabel);
  console.log('\n');

  const handleChange = (evt: InputEvent): void => {
    const { id } = evt.target;

    const update = { [id]: evt.target.value };

    updateFormState((prev) => ({ ...prev, ...update }));
  };

  const handleSubmit = async (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    const { ageMin, ageMax, zipCodes, size } = formState;

    let frontendURL = `/search?&size=${size}`;

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

    const sortOrder = Array.from(selectedSortLabel).join('').trim();

    console.log('sortOrder in handleSubmit ', sortOrder);
    console.log('\n');

    console.log('Array.isArray() in handleSubmit ', Array.isArray(sortOrder));
    console.log('\n');

    if (sortOrder.length) {
      const finalLabel =
        sortOrder === DEFAULT_SORT_LABEL ? DEFAULT_SORT : sortOrder;

      console.log('finalLabel ', finalLabel);
      console.log('\n');

      frontendURL = `${frontendURL}&sort=breed:${finalLabel}`;
    } else {
      frontendURL = `${frontendURL}&sort=breed:${DEFAULT_SORT}`;
    }

    console.log('FINALIZED frontendURL ', frontendURL);
    console.log('\n');

    const searchUpdate = {
      ageMin,
      ageMax,
      zipCodes,
      breeds: selectedBreeds,
      sort: selectedSortKeys,
      size
    };

    if (updateStore) {
      updateStore((prev) => ({ ...prev, ...{ search: searchUpdate } }));
    }

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
        selectedBreedLabel={selectedBreedLabel}
        updateSelectedBreeds={updateSelectedBreeds}
      />

      <DescendDropdown
        selectedSortLabel={selectedSortLabel}
        selectedSortKeys={selectedSortKeys}
        setSelectedSortKeys={setSelectedSortKeys}
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
