'use client';
import { useState, ReactNode } from 'react';
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

  const [selectedBreeds, updateSelectedBreeds] = useState<SharedSelection>(
    new Set(['Affenpinscher'])
  );

  // See Dev Note #1
  const selectedValue = useMemo(() => {
    const baseSelections = Array.from(selectedBreeds);
    const trimmedSelection = baseSelections.slice(0, 1).join(', ').trim();

    return baseSelections.length > 1
      ? `${trimmedSelection}...`
      : trimmedSelection;
  }, [selectedBreeds]);

  const handleChange = (evt: InputEvent): void => {
    const { id } = evt.target;

    const update = { [id]: evt.target.value.trim() };

    updateFormState((prev) => ({ ...prev, ...update }));
  };

  const handleSubmit = async (evt: SubmitEvent): Promise<void> => {};

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
      <Dropdown>
        <DropdownTrigger>
          <Button className="capitalize" variant="bordered">
            {selectedValue}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          className="max-h-[50vh] overflow-y-scroll" // See Dev Note #2
          disallowEmptySelection
          aria-label="Multiple selection example"
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
    </Form>
  );
};

/******************************************** 
   * Notes
   ******************************************** 

   1) Had to cut off the selected breeds in the <Button> selectedValue
      because it was breaking the layout. For now, this solution
      will have to do.
   
   2) DropdownMenu clips DropdownItems if more the 80+.
      Found solution at: https://github.com/heroui-inc/heroui/issues/3244#issuecomment-2173189338

  */
