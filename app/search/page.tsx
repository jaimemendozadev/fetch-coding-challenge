'use client';
import {
  ReactNode,
  useEffect,
  useContext,
  useCallback,
  useRef,
  Suspense
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SearchForm } from '@/components/searchform';
import { BASE_URL, makeBackEndRequest } from '@/utils';
import { StoreContext } from '@/utils/store';
import { HTTP_METHODS, ResponsePayload } from '@/utils/ts';
import {
  extractQueryParams,
  fetchDogDetails,
  formatSearchShape
} from '@/utils/pages';

//ageMin ageMax zipCodes breeds
// http://localhost:3000/search?ageMin=2&ageMax=3&zipCodes=90045&breeds=African%20Hunting%20Dog,Basenji,Basset,Beagle,Bedlington%20Terrier

/*

export interface SearchShape {
  ageMin: string;
  ageMax: string;
  zipCodes: string;
  breeds: SharedSelection;
  sort: string;
  size: number;
}

export interface PaginationShape {
  size: number;
  page: number;
  total_pages: number;
  total: number;
}

*/

const BASE_SEARCH_URL = `${BASE_URL}/dogs/search?`;

function SearchPage(): ReactNode {
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const prevRendered = useRef(false);

  const queryParams = useSearchParams();

  const ageMin = queryParams.get('ageMin');
  const ageMax = queryParams.get('ageMax');
  const zipCodes = queryParams.get('zipCodes');
  const breeds = queryParams.get('breeds');
  const sort = queryParams.get('sort');
  const size = queryParams.get('size');

  const [pagination, updatePagination] = useState(() => {
    let startPage = 1;

    if (typeof window !== 'undefined') {
    }

    const page = queryParams.get('page');

    if (page !== null) {
      startPage = page;
    }

    return startPage;
  });

  const handleSearchRedirect = (frontendURL: string) => {
    router.push(frontendURL);
  };

  const makeSearchRequest = useCallback(
    async (searchURL: string) => {
      try {
        const method: HTTP_METHODS = 'GET';

        const payload = {
          apiURL: searchURL,
          method
        };

        // See Dev Note #4
        const res = await makeBackEndRequest<ResponsePayload>(
          payload,
          true,
          updateStore
        );

        console.log('res in SearchForm ', res);
        console.log('\n');

        /*
        from: 
        the starting index for a set of dogIDs (e.g. if we initially get a 
        
          {resultIDs: dogID[]} with a size of 25, 
        
          from would be 25 because that's the next starting index for the next
        search request

        
        total_pages = (total / size) + (total % size) 
        total: get from "GET /dogs/search"

        Search Result Payload:

        {
          "next": "/dogs/search?size=25&from=25",
          "resultIds": [...],
          "total": 10000
        }

        export interface PaginationShape {
          size: number;
          page: number;
          total_pages: number;
          total: number;
        }

        */

        const calculatePagination = (res: ResponsePayload) => {
          // {size: '25', from: '25'} // the 'from' key is super important.

          let basePagination = { size: 0, page: 0, total_pages: 0, total: 0 };

          if (res.next && res.total) {
            const { total, next } = res;
            const extractedParams = extractQueryParams(next);

            console.log('extractedParams ', extractedParams);
            console.log('\n');

            const { size, from } = extractedParams;

            const numSize = Number.parseInt(size, 10);
            const numFrom = Number.parseInt(from, 10);

            basePagination = { size: numSize, from: numFrom };
          }
        };

        if (res !== undefined) {
          const { next, resultIds, total } = res;

          if (next && next.length > 0) {
            if (resultIds && resultIds.length > 0) {
              const dogDetails = await fetchDogDetails(resultIds);
              console.log('dogDetails ', dogDetails);
              console.log('\n');
            }
          }
        }

        if (res?.resultIds) {
          console.log('perform parallel requests here.');
        }

        const updateSearch = formatSearchShape({
          ageMin,
          ageMax,
          zipCodes,
          breeds,
          sort,
          size
        });

        // See Dev Note #2
        if (updateStore) {
          updateStore((prev) => ({ ...prev, ...{ search: updateSearch } }));
        }
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log('Error in /search page makeSearchRequest hook: ', error);
        console.log('\n');
      }
    },
    [ageMax, ageMin, breeds, size, sort, updateStore, zipCodes]
  );

  const getSearchUrlString = useCallback(() => {
    console.log('ageMin ', ageMin);
    console.log('\n');

    console.log('ageMax ', ageMax);
    console.log('\n');

    console.log('zipCodes ', zipCodes);
    console.log('\n');

    console.log('breeds ', breeds);
    console.log('\n');

    console.log('sort ', sort);
    console.log('\n');

    console.log('size ', size);
    console.log('\n');

    let searchQueryString = '';

    if (ageMin !== null) {
      searchQueryString = `ageMin=${ageMin}`;
    }

    if (ageMax !== null) {
      searchQueryString = `${searchQueryString}&ageMax=${ageMax}`;
    }

    if (zipCodes !== null) {
      searchQueryString = `${searchQueryString}&zipCodes=${zipCodes}`;
    }

    if (breeds !== null) {
      searchQueryString = `${searchQueryString}&breeds=${breeds}`;
    }

    if (sort !== null) {
      searchQueryString = `sort=${sort}`;
    }

    if (size !== null) {
      searchQueryString = `size=${size}`;
    }

    const searchURL =
      searchQueryString.length === 0
        ? BASE_SEARCH_URL
        : `${BASE_SEARCH_URL}${searchQueryString}`;

    return searchURL;
  }, [ageMax, ageMin, breeds, size, sort, zipCodes]);

  useEffect(() => {
    if (!store.user) {
      toast.error(
        'You have not registered. Please sign up/sign in to the app to proceed.',
        { duration: 3000 }
      );
      router.push('/');
    }
  }, [router, store.user]);

  // See Dev Note #3
  useEffect(() => {
    const searchURL = getSearchUrlString();

    if (prevRendered.current === true) {
      console.log('firing makeSearchRequest in secondary hook');
      console.log('\n');
      makeSearchRequest(searchURL);
    }
  }, [getSearchUrlString, makeSearchRequest, updateStore]);

  // See Dev Note #4
  useEffect(() => {
    const searchURL = getSearchUrlString();

    if (prevRendered.current === false) {
      console.log('firing makeSearchRequest in initial hook');
      console.log('\n');
      prevRendered.current = true;
      makeSearchRequest(searchURL);
    }
  }, []);

  return (
    <div>
      <h1>🔍Search Results</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
      {/* TODO: Add <Pagination /> */}
    </div>
  );
}

// See Dev Note #5
export default function WrappedSearchPage(): ReactNode {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  );
}

/******************************************** 
   * Notes
   ******************************************** 

   1) First step is to get Dog IDs from the Backend.
      🚨IMPORTANT: The maximum total number of dogs that will be matched by a single query is 10,000.
   

   2) This handles the case where maybe the user saved the web browser
      URL from a previous session and directly came to the /search page
      without having come from the home page. We have to save the search 
      parameters so the user can continue searching.

   3) This hook should handle all subsequent makeSearchRequests
      after the page has had its first initial render.

   4) This hook handles initial rendering of <SearchPage />, whether the
      user is coming from <HomePage /> or directly goes to <SearchPage />.

   5) Per Vercel Deploy Error logs:
      
      useSearchParams() should be wrapped in a suspense boundary at page "/search". 
      Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

      

  */
