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
    new Set([])
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
