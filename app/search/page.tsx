'use client';
import {
  ReactNode,
  useEffect,
  useContext,
  useCallback,
  Suspense,
  useMemo,
  useState
} from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SearchForm } from '@/components/searchform';
import { BASE_URL, makeBackEndRequest, fetchDogDetails } from '@/utils';
import { StoreContext } from '@/utils/store';
import { HTTP_METHODS, PaginationShape, SearchDogsResponse } from '@/utils/ts';
import { calculatePagination, formatSearchShape } from '@/utils/pages';

// ageMin ageMax zipCodes breeds
// http://localhost:3000/search?ageMin=2&ageMax=3&zipCodes=90045&breeds=African%20Hunting%20Dog,Basenji,Basset,Beagle,Bedlington%20Terrier

const BASE_SEARCH_URL = `${BASE_URL}/dogs/search?`;

function SearchPage(): ReactNode {
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const [flightInfo, updateFlightInfo] = useState({
    inFlight: false,
    destination: ''
  });

  console.log('STORE in /search ', store);
  console.log('\n');

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
    (dogResponse: SearchDogsResponse | void): void => {
      const { search, pagination } = store;

      if (
        search === undefined ||
        pagination === undefined ||
        updateStore === undefined
      )
        return;

      let updatedPagination: PaginationShape = pagination;

      // TODO: Need to tell the store and /search page if there are no results from current query

      if (dogResponse !== undefined) {
        // 🔹 Update the pagination in the Store
        updatedPagination = calculatePagination(
          dogResponse,
          pagination,
          search.size
        );
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

  // Main function that gets dogIDs and fetches dog data
  const searchForDogs = useCallback(
    async (searchURL: string) => {
      updateFlightInfo((prev) => ({
        ...prev,
        ...{ destination: searchURL }
      }));

      const dogIDResponse = await getDogIDs(searchURL);

      console.log('dogIDResponse in searchForDogs ', dogIDResponse);

      if (
        dogIDResponse !== undefined &&
        dogIDResponse.resultIds &&
        dogIDResponse.resultIds.length > 0
      ) {
        const dogDetails = await fetchDogDetails(dogIDResponse.resultIds);

        console.log('dogDetails ', dogDetails);
        console.log('\n');
      }

      updateSearchPagination(dogIDResponse);
    },
    [getDogIDs, updateSearchPagination]
  );

  useEffect(() => {
    const searchURL = getSearchUrlString();

    const { inFlight, destination } = flightInfo;

    const isNewDeparture =
      destination.length === 0 || destination !== searchURL;

    if (isNewDeparture && inFlight === false) {
      console.log('🔄 Firing makeSearchRequest for URL: ', searchURL);

      updateFlightInfo((prev) => ({
        ...prev,
        ...{ inFlight: true }
      }));

      searchForDogs(searchURL);

      updateFlightInfo((prev) => ({
        ...prev,
        ...{ inFlight: false }
      }));
    }
  }, [
    flightInfo,
    getDogIDs,
    getSearchUrlString,
    searchForDogs,
    updateSearchPagination,
    updateStore
  ]);

  useEffect(() => {
    if (!store.user) {
      toast.error(
        'You have not registered. Please sign up/sign in to the app to proceed.',
        { duration: 3000 }
      );
      router.push('/');
    }
  }, [router, store.user]);

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
