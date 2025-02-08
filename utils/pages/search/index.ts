import { BASE_URL } from '@/utils';
import { SearchShape, PaginationShape, SearchDogsResponse } from '@/utils/ts';

export const extractQueryParams = (nextUrl: string): Record<string, string> => {
  const url = new URL(nextUrl, BASE_URL);
  const params = new URLSearchParams(url.search);

  return Object.fromEntries(params.entries());
};

export interface SearchQueryObject {
  ageMin?: string;
  ageMax?: string;
  zipCodes?: string;
  breeds?: string;
  sort?: string;
  size?: string;
}

export const formatSearchShape = (
  storeSearch: SearchShape,
  searchQuery: SearchQueryObject
): SearchShape => {
  const updatedStore: SearchShape = { ...storeSearch };

  const stringSearchKeys = ['ageMin', 'ageMax', 'zipCodes'] as const;

  stringSearchKeys.forEach((key) => {
    if (
      Object.hasOwn(searchQuery, key) &&
      searchQuery[key] !== undefined &&
      searchQuery[key] !== null
    ) {
      updatedStore[key] = searchQuery[key];
    }
  });

  if (
    Object.hasOwn(searchQuery, 'breeds') &&
    searchQuery['breeds'] !== undefined &&
    searchQuery['breeds'] !== null
  ) {
    const breedsArray = searchQuery['breeds'].split(',');

    updatedStore['breeds'] = new Set([
      ...updatedStore.breeds,
      ...new Set(breedsArray)
    ]);
  }

  if (
    Object.hasOwn(searchQuery, 'size') &&
    searchQuery['size'] !== undefined &&
    searchQuery['size'] !== null
  ) {
    const sizeStrValue = searchQuery['size'];

    const conversion = Number.parseInt(sizeStrValue, 10);

    if (Number.isNaN(conversion) === false) {
      updatedStore['size'] = conversion;
    }
  }

  return updatedStore;
};

// See Dev Note #1
export const calculatePagination = (
  dogIDResponse: SearchDogsResponse,
  storePagination: PaginationShape,
  storeSearchSize: number
): PaginationShape => {
  const { page, from } = storePagination;

  const basePagination = {
    page,
    total_pages: 0,
    total: 0,
    from
  };

  if (dogIDResponse.next) {
    const { next } = dogIDResponse;
    const extractedParams = extractQueryParams(next);

    console.log('extractedParams ', extractedParams);
    console.log('\n');

    const { from } = extractedParams;

    const numFrom = Number.parseInt(from, 10);

    basePagination['from'] = numFrom;
  }

  if (dogIDResponse.total !== undefined) {
    const basePages = Math.floor(dogIDResponse.total / storeSearchSize);
    const remainder = dogIDResponse.total % storeSearchSize;
    const total_pages = basePages + remainder;

    basePagination['total_pages'] = total_pages;
    basePagination['total'] = dogIDResponse.total;
  }

  return basePagination;
};

/******************************************** 
   * Notes
   ******************************************** 
   

   1) Below is an example of what the shape of the res argument could look like:

      {
       "next": "/dogs/search?size=25&from=25",
       "resultIds": [...],
       "total": 10000
      }

  */
