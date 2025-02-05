import { useState, useMemo, ReactNode } from 'react';

import { DOG_BREEDS } from '@/utils';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  SharedSelection
} from '@heroui/react';

export const BreedDropdown = (): ReactNode => {
  const [selectedBreeds, updateSelectedBreeds] = useState<SharedSelection>(
    new Set(['Dingo'])
  );

  const selectedValue = useMemo(
    () => Array.from(selectedBreeds).join(', '),
    [selectedBreeds]
  );

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button className="capitalize" variant="bordered">
          {selectedValue}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        className="max-h-[50vh] overflow-y-auto" // See Dev Note #1
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
  );
};

/******************************************** 
   * Notes
   ******************************************** 
   
   1) DropdownMenu clips DropdownItems if more the 80+.
      Found solution at: https://github.com/heroui-inc/heroui/issues/3244#issuecomment-2173189338

  */
