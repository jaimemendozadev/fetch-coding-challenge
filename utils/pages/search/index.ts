import { BASE_URL } from '@/utils';
import { DEFAULT_RESULT_SIZE, DEFAULT_SORT } from '@/utils/store';
import { SearchShape } from '@/utils/ts';

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

/******************************************** 
   * Notes
   ******************************************** 
   

   1) Added just in case there somehow was no sort query
      parameter. Better to add the default sort paramater
      to be saved in the Store for subsequent API requests.   

  */
