'use client';
import {
  ReactNode,
  useEffect,
  useContext,
  useCallback,
  useRef,
  Suspense,
  useMemo
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SearchForm } from '@/components/searchform';
import { BASE_URL, makeBackEndRequest } from '@/utils';
import { StoreContext } from '@/utils/store';
import { HTTP_METHODS, SearchDogsResponse } from '@/utils/ts';
import {
  calculatePagination,
  fetchDogDetails,
  formatSearchShape
} from '@/utils/pages';

// ageMin ageMax zipCodes breeds
// http://localhost:3000/search?ageMin=2&ageMax=3&zipCodes=90045&breeds=African%20Hunting%20Dog,Basenji,Basset,Beagle,Bedlington%20Terrier

const BASE_SEARCH_URL = `${BASE_URL}/dogs/search?`;

function SearchPage(): ReactNode {
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const prevRendered = useRef(false);

  // 📝 Extract search parameters into an object
  const searchParams = useSearchParams();

  const searchQuery = useMemo(() => {
    return {
      ageMin: searchParams.get('ageMin'),
      ageMax: searchParams.get('ageMax'),
      zipCodes: searchParams.get('zipCodes'),
      breeds: searchParams.get('breeds'),
      sort: searchParams.get('sort'),
      size: searchParams.get('size')
    };
  }, [searchParams]);

  const { pagination, search } = store;

  const handleSearchRedirect = (frontendURL: string) => {
    router.push(frontendURL);
  };

  // 🔹 Builds the full search URL using URLSearchParams
  const getSearchUrlString = useCallback(() => {
    const urlParams = new URLSearchParams(
      searchQuery as Record<string, string>
    );
    return `${BASE_SEARCH_URL}${urlParams.toString()}`;
  }, [searchQuery]);

  const makeSearchRequest = useCallback(
    async (searchURL: string) => {
      try {
        const method: HTTP_METHODS = 'GET';

        const payload = {
          apiURL: searchURL,
          method
        };

        // See Dev Note #4
        const res = await makeBackEndRequest<SearchDogsResponse>(
          payload,
          true,
          updateStore
        );

        console.log('📝 Search Response:', res);
        console.log('\n');

        if (res && pagination && search?.size && updateStore) {
          // Update the pagination in the Store
          const updatePagination = calculatePagination(
            res,
            pagination,
            search.size
          );

          updateStore((prev) => ({
            ...prev,
            ...{ pagination: updatePagination }
          }));

          // const { resultIds } = res;

          if (Array.isArray(res.resultIds) && res.resultIds.length > 0) {
            try {
              const dogDetails = await fetchDogDetails(res.resultIds);
              console.log('🐶 Dog Details:', dogDetails);
            } catch (fetchError) {
              console.error('⚠️ Error fetching dog details:', fetchError);
            }
          }
        }

        // See Dev Note #2
        if (updateStore) {
          updateStore((prev) => ({
            ...prev,
            ...{ search: formatSearchShape(searchQuery) }
          }));
        }
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log('Error in /search page makeSearchRequest hook: ', error);
        console.log('\n');
      }
    },
    [pagination, search, searchQuery, updateStore]
  );

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

    if (prevRendered.current) {
      console.log('🔄 Firing makeSearchRequest on update');
      makeSearchRequest(searchURL);
    } else {
      console.log('🚀 Initial render makeSearchRequest');
      prevRendered.current = true;
      makeSearchRequest(searchURL);
    }
  }, [getSearchUrlString, makeSearchRequest, updateStore]);

  return (
    <div>
      <h1>🔍Search Results</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
      {/* TODO: Add <Pagination /> */}
    </div>
  );
}

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

   3) This hook:
     - handles initial rendering of <SearchPage />, whether the
       user is coming from <HomePage /> or directly goes to <SearchPage />.
   
     - handle all subsequent makeSearchRequests after the page has had 
       its first initial render.



  */
