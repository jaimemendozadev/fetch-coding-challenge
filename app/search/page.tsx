'use client';
import {
  ReactNode,
  useEffect,
  useContext,
  useCallback,
  useRef,
  Suspense
} from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SearchForm } from '@/components/searchform';
import { BASE_URL, formatSearchShape, makeBackEndRequest } from '@/utils';
import { StoreContext } from '@/utils/store';
import { HTTP_METHODS } from '@/utils/ts';
import { useSearchParams } from 'next/navigation';

//ageMin ageMax zipCodes breeds
// http://localhost:3000/search?ageMin=2&ageMax=3&zipCodes=90045&breeds=African%20Hunting%20Dog,Basenji,Basset,Beagle,Bedlington%20Terrier

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

        const res = await makeBackEndRequest(payload, true, updateStore);

        console.log('res in SearchForm ', res);
        console.log('\n');

        const updateSearch = formatSearchShape(
          ageMin,
          ageMax,
          zipCodes,
          breeds
        );

        // See Dev Note #1
        if (updateStore) {
          updateStore((prev) => ({ ...prev, ...{ search: updateSearch } }));
        }
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log('Error in /search page makeSearchRequest hook: ', error);
        console.log('\n');
      }
    },
    [ageMax, ageMin, breeds, updateStore, zipCodes]
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

    const searchURL =
      searchQueryString.length === 0
        ? BASE_SEARCH_URL
        : `${BASE_SEARCH_URL}${searchQueryString}`;

    return searchURL;
  }, [ageMax, ageMin, breeds, zipCodes]);

  useEffect(() => {
    if (!store.user) {
      toast.error(
        'You have not registered. Please sign up/sign in to the app to proceed.',
        { duration: 3000 }
      );
      router.push('/');
    }
  }, [router, store.user]);

  // See Dev Note #2
  useEffect(() => {
    const searchURL = getSearchUrlString();

    if (prevRendered.current === true) {
      console.log('firing makeSearchRequest in secondary hook');
      console.log('\n');
      makeSearchRequest(searchURL);
    }
  }, [getSearchUrlString, makeSearchRequest, updateStore]);

  // See Dev Note #3
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
    </div>
  );
}

// See Dev Note #4
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
   1) This handles the case where maybe the user saved the web browser
      URL from a previous session and directly came to the /search page
      without having come from the home page. We have to save the search 
      parameters so the user can continue searching.

   2) This hook should handle all subsequent makeSearchRequests
      after the page has had its first initial render.

   3) This hook handles initial rendering of <SearchPage />, whether the
      user is coming from <HomePage /> or directly goes to <SearchPage />.

   4) Per Vercel Deploy Error logs:
      
      useSearchParams() should be wrapped in a suspense boundary at page "/search". 
      Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

      

  */
