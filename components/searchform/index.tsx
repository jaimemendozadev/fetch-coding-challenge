'use client';
// import { useState, useContext, ReactNode } from 'react';
import { BreedDropdown } from './breeddropdown';

export const SearchForm = () => {
//   const [zipArray, updateZipArray] = useState<number[]>([]);
//   const [ageRange, updateAgeRange] = useState<{
//     min: number | null;
//     max: number | null;
//   }>({ min: null, max: null });

  return (
    <form className="h-[300px] border border-orange-800">
      <BreedDropdown />
    </form>
  );
};
