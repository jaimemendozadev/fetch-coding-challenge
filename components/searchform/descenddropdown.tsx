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

interface DescendDropdownProps {
  selectedSort: string;
  selectedSortKeys: SharedSelection;
  setSelectedSortKeys: Dispatch<SetStateAction<SharedSelection>>;
}

export const DescendDropdown = ({
  selectedSort,
  selectedSortKeys,
  setSelectedSortKeys
}: DescendDropdownProps): ReactNode => (
  <Dropdown>
    <DropdownTrigger>
      <Button className="capitalize" variant="bordered">
        {selectedSort}
      </Button>
    </DropdownTrigger>
    <DropdownMenu
      disallowEmptySelection
      aria-label="Single selection example"
      selectedKeys={selectedSortKeys}
      selectionMode="single"
      variant="flat"
      onSelectionChange={setSelectedSortKeys}
    >
      <DropdownItem key="asc">Ascending Order</DropdownItem>
      <DropdownItem key="desc">Descending Order</DropdownItem>
    </DropdownMenu>
  </Dropdown>
);
