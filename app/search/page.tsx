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
import { calculatePagination, formatSearchShape } from '@/utils/pages';

// ageMin ageMax zipCodes breeds
// http://localhost:3000/search?ageMin=2&ageMax=3&zipCodes=90045&breeds=African%20Hunting%20Dog,Basenji,Basset,Beagle,Bedlington%20Terrier

const BASE_SEARCH_URL = `${BASE_URL}/dogs/search?`;

function SearchPage(): ReactNode {
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const prevRendered = useRef(false);

  // 📝 Extract search parameters into an object
  const searchParams = useSearchParams();

  // 2-7-2025 TODO: Figure out why sort doens't work.
  const searchQuery = useMemo(() => {
    const searchKeys = ['ageMin', 'ageMax', 'zipCodes', 'breeds', 'size'];

    const paramsObject: { [key: string]: string } = {};

    searchKeys.forEach((key) => {
      const paramsValue = searchParams.get(key);
      if (paramsValue !== null) {
        paramsObject[key] = paramsValue;
      }
    });

    return paramsObject;
  }, [searchParams]);

  const { pagination, search } = store;

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

        console.log(`📝 Making Search Request with searchURL ${searchURL}`);
        console.log('\n');

        const payload = {
          apiURL: searchURL,
          method
        };

        // 🔹 Get the dogIDs from the searchURL
        const res = await makeBackEndRequest<SearchDogsResponse>(
          payload,
          true,
          updateStore
        );

        console.log('📝 Search Response:', res);
        console.log('\n');

        if (res && Array.isArray(res.resultIds) && res.resultIds.length > 0) {
          if (pagination && search?.size && updateStore) {
            // 🔹 Update the pagination in the Store
            const updatePagination = calculatePagination(
              res,
              pagination,
              search.size
            );

            // 🔹 See Dev Note #2 for saving searchParams in the Store
            updateStore((prev) => ({
              ...prev,
              ...{
                pagination: updatePagination,
                search: formatSearchShape(searchQuery)
              }
            }));
          }

          try {
            const method: HTTP_METHODS = 'POST';
            const fetchPayload = {
              apiURL: `${BASE_URL}/dogs`,
              method,
              bodyPayload: res.resultIds
            };

            const dogDetails = await makeBackEndRequest(
              fetchPayload,
              true,
              updateStore
            );
            console.log('🐶 Dog Details:', dogDetails);
            return;
          } catch (fetchError) {
            console.error('⚠️ Error fetching dog details:', fetchError);
            toast.error(
              'There was a problem fetching the dog details. 😞 Try again later.',
              { duration: 3000 }
            );
          }
        } else {
          toast.error(
            'There were no results for your search query. 🥺 Try again.',
            { duration: 3000 }
          );
        }
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log('⚠️ Error in /search page makeSearchRequest hook: ', error);
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

  const handleSearchRedirect = (frontendURL: string) => {
    router.push(frontendURL);
  };

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
