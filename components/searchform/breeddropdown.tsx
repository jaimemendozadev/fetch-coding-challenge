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

  return (
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
