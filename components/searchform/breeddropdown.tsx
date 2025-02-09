'use client';
import { ReactNode, Dispatch, SetStateAction } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  SharedSelection
} from '@heroui/react';
import { DOG_BREEDS } from './utils';

interface BreedDropdownProps {
  selectedValue: string;
  selectedBreeds: SharedSelection;
  updateSelectedBreeds: Dispatch<SetStateAction<SharedSelection>>;
}

export const BreedDropdown = ({
  selectedValue,
  selectedBreeds,
  updateSelectedBreeds
}: BreedDropdownProps): ReactNode => (
  <Dropdown>
    <DropdownTrigger>
      <Button className="capitalize" variant="bordered">
        {selectedValue}
      </Button>
    </DropdownTrigger>
    <DropdownMenu
      className="max-h-[50vh] overflow-y-scroll" // See Dev Note #1
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
);

/******************************************** 
   * Notes
   ******************************************** 
   
   1) DropdownMenu clips DropdownItems if more the 80+.
      Found solution at: https://github.com/heroui-inc/heroui/issues/3244#issuecomment-2173189338
      

  */
