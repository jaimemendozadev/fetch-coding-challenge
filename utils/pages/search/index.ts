import { BASE_URL } from '@/utils';
import { SearchShape, PaginationShape, SearchDogsResponse } from '@/utils/ts';

export const extractQueryParams = (nextUrl: string): Record<string, string> => {
  const url = new URL(nextUrl, BASE_URL);
  const params = new URLSearchParams(url.search);

  return Object.fromEntries(params.entries());
};

export interface SearchQueryObject {
  parameters: {
    ageMin?: string;
    ageMax?: string;
    zipCodes?: string;
    breeds?: string;
    sort?: string;
    size?: string;
  };
  apiURL: string;
}

export const formatSearchShape = (
  searchStoreSlice: SearchShape,
  searchQuery: SearchQueryObject
): SearchShape => {
  const updatedStore: SearchShape = { ...searchStoreSlice };

  const { parameters } = searchQuery;

  const stringSearchKeys = ['ageMin', 'ageMax', 'zipCodes'] as const;

  stringSearchKeys.forEach((key) => {
    if (
      Object.hasOwn(parameters, key) &&
      parameters[key] !== undefined &&
      parameters[key] !== null
    ) {
      updatedStore[key] = parameters[key];
    }
  });

  if (
    Object.hasOwn(parameters, 'breeds') &&
    parameters['breeds'] !== undefined &&
    parameters['breeds'] !== null
  ) {
    const breedsArray = parameters['breeds'].split(',');

    updatedStore['breeds'] = new Set([
      ...updatedStore.breeds,
      ...new Set(breedsArray)
    ]);
  }

  if (
    Object.hasOwn(parameters, 'sort') &&
    parameters['sort'] !== undefined &&
    parameters['sort'] !== null
  ) {
    // See Dev Note #1
    const sortDirectionArray = parameters['sort'].split(/:/);

    const length = sortDirectionArray.length;
    const finalDirection =
      sortDirectionArray.length > 1
        ? sortDirectionArray[length - 1]
        : sortDirectionArray[0];

    updatedStore['sort'] = new Set([
      ...updatedStore.sort,
      ...new Set(finalDirection)
    ]);
  }

  if (
    Object.hasOwn(parameters, 'size') &&
    parameters['size'] !== undefined &&
    parameters['size'] !== null
  ) {
    const sizeStrValue = parameters['size'];

    const conversion = Number.parseInt(sizeStrValue, 10);

    if (Number.isNaN(conversion) === false) {
      updatedStore['size'] = conversion;
    }
  }

  return updatedStore;
};

// See Dev Note #2
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

    console.log('extractedParams calculatePagination ', extractedParams);
    console.log('\n');

    const { from } = extractedParams;

    const numFrom = Number.parseInt(from, 10);

    basePagination['from'] = numFrom;
  }

  if (dogIDResponse.total !== undefined) {
    const totalRecords = dogIDResponse.total;

    const basePages = Math.floor(totalRecords / storeSearchSize);
    const remainder = totalRecords % storeSearchSize;
    const total_pages = basePages + remainder;

    basePagination['total_pages'] = total_pages;
    basePagination['total'] = totalRecords;
  }

  return basePagination;
};

/******************************************** 
   * Notes
   ******************************************** 
   

   1) At this point, the sort queryParamater value is 

      sort=[field]:[direction] 

      such as:

      sort=breed:asc

      That's why for the sort value, we have to split it
      by the : semi-colon to get either the 'asc' or
      'desc' value.

      
   2) Below is an example of what the shape of the res argument could look like:

      {
       "next": "/dogs/search?size=25&from=25",
       "resultIds": [...],
       "total": 10000
      }

  */
