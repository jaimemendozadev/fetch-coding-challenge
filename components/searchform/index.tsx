'use client';
import { useState, ReactNode, useMemo, useContext } from 'react';
import toast from 'react-hot-toast';
import { Button, SharedSelection, Input, Form } from '@heroui/react';
import { ClearIcon } from './clearicon';
import { BreedDropdown } from './breeddropdown';
import { DescendDropdown } from './descenddropdown';
import { InputEvent, SearchShape, SubmitEvent } from '@/utils/ts';
import {
  DEFAULT_RESULT_SIZE,
  StoreContext,
  createInitStore
} from '@/utils/store';
import { getFrontendSearchURL, getZipCodesFromString } from './utils';

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
export const DEFAULT_SORT_LABEL = 'Sort Results in';

const DEFAULT_FORM_STATE: FormState = {
  ageMin: '',
  ageMax: '',
  zipCodes: '',
  size: DEFAULT_RESULT_SIZE
};

// TODO: Need to use searchParams to initialize local state when user copies/pastes URL path in web browser
export const SearchForm = ({ submitCallback }: SearchFormProps): ReactNode => {
  const { store, updateStore } = useContext(StoreContext);

  const [formState, updateFormState] = useState<FormState>(() => {
    const { search } = store;

    let base = DEFAULT_FORM_STATE;

    if (search) {
      const { ageMin, ageMax, zipCodes, size } = search;

      base = {
        ageMin,
        ageMax,
        zipCodes: `${zipCodes}`, // See Dev Note #1
        size: size ? size : DEFAULT_RESULT_SIZE
      };
    }

    return base;
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

  console.log('store inside SearchForm ', store);
  console.log('\n');

  console.log('selectedBreeds inside SearchForm ', selectedBreeds);
  console.log('\n');

  // See Dev Note #2
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

      if (search && search.sort) {
        const directionCheck = new Set([...search.sort]);

        if (directionCheck.has('desc')) {
          return new Set(['desc']);
        }

        if (directionCheck.has('asc')) {
          return new Set(['asc']);
        }
      }

      return new Set([]);
    }
  );

  console.log('selectedSortKeys inside SearchForm ', selectedSortKeys);
  console.log('\n');

  const selectedSortLabel = useMemo(() => {
    const sortSelection = Array.from(selectedSortKeys);

    if (sortSelection.length === 0) return DEFAULT_SORT_LABEL;

    return sortSelection.join('');
  }, [selectedSortKeys]);

  const handleChange = (evt: InputEvent): void => {
    const { id } = evt.target;

    const update = { [id]: evt.target.value };

    updateFormState((prev) => ({ ...prev, ...update }));
  };

  const clearSearch = () => {
    if (!updateStore) return; // 🔹 Exit early if `updateStore` is undefined

    let storedUserInfo = store.user ?? null;

    // Retrieve user from localStorage if not in store
    if (!storedUserInfo && typeof window !== 'undefined') {
      const storageValue = localStorage.getItem('user');
      if (storageValue) storedUserInfo = JSON.parse(storageValue);
    }

    const storeUpdate = storedUserInfo
      ? { ...createInitStore(), user: storedUserInfo }
      : createInitStore();

    // Update store only if there's a valid user
    updateStore(storeUpdate);

    // Reset local state
    updateFormState(DEFAULT_FORM_STATE);
    updateSelectedBreeds(new Set([]));
    setSelectedSortKeys(new Set([]));
  };

  const handleSubmit = async (evt: SubmitEvent): Promise<void> => {
    evt.preventDefault();

    const { ageMin, ageMax, zipCodes, size } = formState;

    if (ageMin.length) {
      const minCheck = Number.parseInt(ageMin, 10);

      if (Number.isNaN(minCheck)) {
        toast.error('Please enter a valid minimum age.');
        return;
      }
    }

    if (ageMax.length) {
      const maxCheck = Number.parseInt(ageMax, 10);

      if (Number.isNaN(maxCheck)) {
        toast.error('Please enter a valid max age.');
        return;
      }
    }

    let convertedCodes: number[] = [];

    const parsedZipCodes = getZipCodesFromString(zipCodes);

    if (parsedZipCodes === null && zipCodes.length > 0) {
      toast.error('Please enter valid 5 digit zip codes.');
      return;
    }

    if (parsedZipCodes !== null) {
      convertedCodes = parsedZipCodes
        .map((codeString) => Number.parseInt(codeString, 10))
        .filter((num) => !Number.isNaN(num));

      if (convertedCodes.length !== parsedZipCodes.length) {
        toast.error('Please enter valid 5 digit zip codes.');
        return;
      }
    }

    const finalizedCodes = convertedCodes.map((num) => num.toString());

    const searchUpdate: SearchShape = {
      ageMin,
      ageMax,
      zipCodes: finalizedCodes,
      breeds: selectedBreeds,
      sort: selectedSortKeys,
      size
    };

    const frontendURL = getFrontendSearchURL(searchUpdate);

    // See Dev Note #3 re: Paginaiton
    if (updateStore) {
      updateStore((prev) => ({ ...prev, ...{ search: searchUpdate } }));
    }

    submitCallback(frontendURL);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="max-w-[80%] mb-10 p-6 mx-auto flex flex-row justify-around items-center space-x-4 border-2 border-[#DF2A87] rounded-md"
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
        onPress={clearSearch}
      >
        <ClearIcon fill="white" size={24} height={24} width={24} />
      </Button>
      <Button className="bg-[#0098F3] text-white" type="submit">
        Search
      </Button>
    </Form>
  );
};

/******************************************** 
   * Notes
   ******************************************** 

   1) While in the UI the zipCodes are collected as a ,comma
      delimited string of 5-digit numbers, after performing
      all the checks to ensure the zip codes are valid, the
      final value of number[] are interpolated into the
      frontendURL. Hence why zipCodes are saved in the store
      with a type of string[].

   2) Had to cut off the selected breeds in the <Button> selectedValue
      because it was breaking the layout. For now, this solution
      will have to do.

      We're also handling the default "Choose a Breed" default label
      in a hacky way because the <DropdownMenu /> emptyContent prop
      doesn't work.
      

    3) When making a new search for dogs, WE NEVER add the 'from'
       query parameter to the intial URL. When making the initial
       search request, if we successfully find dogIDs for the
       initial search, the SearchDogResponse will have a "next"
       property that will tell you the starting index of the next
       set of records you can fetch for that particular search. 
       
       See Dev Note #2 of calculatePagination util function
       for more details.
  */

/*
    2-7-25 TODO: 
     - Need to add checkboxes or something to handle toggling between desc & asc sorting.
  
    ➕ Feature:   
      - Need to add an input field for result size.
  */
