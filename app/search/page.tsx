'use client';
import {
  ReactNode,
  useEffect,
  useContext,
  useCallback,
  useRef,
  Suspense,
  useMemo,
  useState
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SearchForm } from '@/components/searchform';
import { BASE_URL, makeBackEndRequest } from '@/utils';
import { StoreContext } from '@/utils/store';
import { HTTP_METHODS, PaginationShape, SearchDogsResponse } from '@/utils/ts';
import { calculatePagination, formatSearchShape } from '@/utils/pages';

// ageMin ageMax zipCodes breeds
// http://localhost:3000/search?ageMin=2&ageMax=3&zipCodes=90045&breeds=African%20Hunting%20Dog,Basenji,Basset,Beagle,Bedlington%20Terrier

const BASE_SEARCH_URL = `${BASE_URL}/dogs/search?`;

function SearchPage(): ReactNode {
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const [inFlight, updateFlightStatus] = useState(false);
  const prevRendered = useRef(false);

  // 📝 Extract search parameters into an object
  const searchParams = useSearchParams();

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

  // 🔹 Builds the full search URL using URLSearchParams
  const getSearchUrlString = useCallback(() => {
    const urlParams = new URLSearchParams(
      searchQuery as Record<string, string>
    );
    return `${BASE_SEARCH_URL}${urlParams.toString()}`;
  }, [searchQuery]);

  const updateSearchPagination = useCallback(
    (res: SearchDogsResponse | void): void => {
      const { search, pagination } = store;

      if (
        search === undefined ||
        pagination === undefined ||
        updateStore === undefined
      )
        return;

      let updatedPagination: PaginationShape = pagination;

      if (res !== undefined) {
        // 🔹 Update the pagination in the Store
        updatedPagination = calculatePagination(res, pagination, search.size);
      }

      const updatedSearch = formatSearchShape(search, searchQuery);

      const storeUpdate = {
        pagination: updatedPagination,
        search: updatedSearch
      };

      updateStore((prevState) => ({ ...prevState, ...storeUpdate }));
    },
    [searchQuery, store, updateStore]
  );

  const getDogIDs = useCallback(
    async (searchURL: string): Promise<SearchDogsResponse | void> => {
      let errorFeedback: string | null = null;

      try {
        const method: HTTP_METHODS = 'GET';

        console.log(`📝 Making Search Request with searchURL ${searchURL}`);
        console.log('\n');

        const payload = {
          apiURL: searchURL,
          method
        };

        // 🔹 Get the dogIDs from the searchURL
        const res = await makeBackEndRequest<SearchDogsResponse>(payload, true);

        console.log('📝 Search Response:', res);
        console.log('\n');

        if (
          'resultIds' in res &&
          Array.isArray(res?.resultIds) &&
          res.resultIds.length > 0
        ) {
          return res;
        } else {
          errorFeedback =
            'There were no results for your search query. 🥺 Try again.';
        }
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log('⚠️ Error in /search page makeSearchRequest hook: ', error);
        console.log('\n');

        errorFeedback =
          'There was an error making your request. Try again later';
      }

      if (errorFeedback !== null) {
        toast.error(errorFeedback, { duration: 3000 });
      }
    },
    []
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
    const makeDogIDsRequest = async (searchURL: string) => {
      const dogIDRes = await getDogIDs(searchURL);

      console.log('dogIDRes in makeDogIDsRequest ', dogIDRes);

      updateSearchPagination(dogIDRes);
    };

    const searchURL = getSearchUrlString();

    if (prevRendered.current === false && inFlight === false) {
      console.log('🚀 Initial render makeSearchRequest');
      updateFlightStatus(true);
      prevRendered.current = true;
      makeDogIDsRequest(searchURL);

      updateFlightStatus(false);
    }
  }, []);

  // See Dev Note #3
  useEffect(() => {
    const makeDogIDsRequest = async (searchURL: string) => {
      const dogIDRes = await getDogIDs(searchURL);

      console.log('dogIDRes in makeDogIDsRequest ', dogIDRes);

      updateSearchPagination(dogIDRes);
    };

    const searchURL = getSearchUrlString();

    if (prevRendered.current === true && inFlight === false) {
      console.log('🔄 Firing makeSearchRequest on update');
      updateFlightStatus(true);
      makeDogIDsRequest(searchURL);
    }
  }, [
    getDogIDs,
    getSearchUrlString,
    inFlight,
    updateSearchPagination,
    updateStore
  ]);

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
