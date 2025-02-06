'use client';
import { BASE_URL } from '@/utils';
import { useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';

//ageMin ageMax zipCodes breeds

let searchURL = `${BASE_URL}/dogs/search?`;

export default function SearchPage(): ReactNode {
  const queryParams = useSearchParams();

  const ageMin = queryParams.get('ageMin');
  const ageMax = queryParams.get('ageMax');
  const zipCodes = queryParams.get('zipCodes');
  const breeds = queryParams.get('breeds');

  console.log('ageMin ', ageMin);
  console.log('\n');

  console.log('ageMax ', ageMax);
  console.log('\n');

  console.log('zipCodes ', zipCodes);
  console.log('\n');

  console.log('breeds ', breeds);
  console.log('\n');

  return (
    <div>
      <h1>Search Results</h1>
    </div>
  );
}
