import { BASE_URL } from '@/utils';
import { DEFAULT_RESULT_SIZE, DEFAULT_SORT } from '@/utils/store';
import { SearchShape, PaginationShape, SearchDogsResponse } from '@/utils/ts';

export const extractQueryParams = (nextUrl: string): Record<string, string> => {
  const url = new URL(nextUrl, BASE_URL);
  const params = new URLSearchParams(url.search);

  return Object.fromEntries(params.entries());
};

interface FormatShapeArgs {
  ageMin: string | null;
  ageMax: string | null;
  zipCodes: string | null;
  breeds: string | null;
  sort: string | null;
  size: string | null;
}

export const formatSearchShape = (shapeArgs: FormatShapeArgs): SearchShape => {
  const { ageMin, ageMax, zipCodes, breeds, sort, size } = shapeArgs;

  const searchShape: SearchShape = {
    sort: '',
    ageMin: '',
    ageMax: '',
    zipCodes: '',
    breeds: new Set([]),
    size: DEFAULT_RESULT_SIZE
  };

  // See Dev Note #1
  if (typeof sort === 'string' && sort.length > 0) {
    searchShape['sort'] = sort;
  } else {
    searchShape['sort'] = DEFAULT_SORT;
  }

  if (ageMin !== null) {
    searchShape['ageMin'] = ageMin;
  }

  if (ageMax !== null) {
    searchShape['ageMax'] = ageMax;
  }

  if (zipCodes !== null) {
    searchShape['zipCodes'] = zipCodes;
  }

  if (typeof breeds === 'string' && breeds.length > 0) {
    const breedArray = breeds.trim().split(',');

    searchShape['breeds'] = new Set(breedArray);
  }

  if (size !== null) {
    const convertedNum = Number.parseInt(size, 10);
    searchShape['size'] = Number.isNaN(convertedNum)
      ? DEFAULT_RESULT_SIZE
      : convertedNum;
  }

  return searchShape;
};

export const fetchDogDetails = async (dogIDs: string[]): Promise<any[]> => {
  const BATCH_LIMIT = 100;
  const batches = [];

  // Split dog IDs into groups of 100
  for (let index = 0; index < dogIDs.length; index += BATCH_LIMIT) {
    batches.push(dogIDs.slice(index, index + BATCH_LIMIT));
  }

  console.log(`Fetching dog details in ${batches.length} batch(es)...`);

  // Fetch all batches in parallel
  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      const response = await fetch(`${BASE_URL}/dogs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });
      return response.json();
    })
  );

  // Extract successful responses
  return results
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => (result as PromiseFulfilledResult<any[]>).value);
};

// See Dev Note #2
export const calculatePagination = (
  res: SearchDogsResponse,
  storePagination: PaginationShape,
  storeSearchSize: number
): PaginationShape => {
  const { page, from } = storePagination;

  const basePagination = {
    size: 0,
    page,
    total_pages: 0,
    total: 0,
    from
  };

  if (res.next) {
    const { next } = res;
    const extractedParams = extractQueryParams(next);

    console.log('extractedParams ', extractedParams);
    console.log('\n');

    const { from } = extractedParams;

    const numFrom = Number.parseInt(from, 10);

    basePagination['from'] = numFrom;
  }

  if (res.total !== undefined) {
    const basePages = Math.floor(res.total / storeSearchSize);
    const remainder = res.total % storeSearchSize;
    const total_pages = basePages + remainder;

    basePagination['total_pages'] = total_pages;
    basePagination['total'] = res.total;
  }

  return basePagination;
};

/******************************************** 
   * Notes
   ******************************************** 
   

   1) Added just in case there somehow was no sort query
      parameter. Better to add the default sort paramater
      to be saved in the Store for subsequent API requests.   

   2) Below is an example of what the shape of the res argument could look like:

      {
       "next": "/dogs/search?size=25&from=25",
       "resultIds": [...],
       "total": 10000
      }

  */
