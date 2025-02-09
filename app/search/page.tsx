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
import { Pagination } from '@/components/pagination';
import { BASE_URL, makeBackEndRequest, fetchDogDetails } from '@/utils';
import { StoreContext } from '@/utils/store';
import {
  DogDetails,
  HTTP_METHODS,
  PaginationShape,
  SearchDogsResponse
} from '@/utils/ts';
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

  // 🔹 Builds the searchQuery object with queryParameters & apiURL
  const searchQuery = useMemo(() => {
    const searchKeys = [
      'ageMin',
      'ageMax',
      'zipCodes',
      'breeds',
      'size',
      'sort'
    ];

    const paginationKeys = ['from'];

    const paramsKeys = [...searchKeys, ...paginationKeys];

    const collectedParams: { [key: string]: string } = {};

    paramsKeys.forEach((key) => {
      const paramsValue = searchParams.get(key);
      if (paramsValue !== null) {
        collectedParams[key] = paramsValue;
      }
    });

    const urlParams = new URLSearchParams(
      collectedParams as Record<string, string>
    );
    const url = `${BASE_SEARCH_URL}${urlParams.toString()}`;

    return { parameters: collectedParams, apiURL: url };
  }, [searchParams]);

  console.log('searchQuery  in /search ', searchQuery);
  console.log('\n');

  const finalizeStoreUpdate = useCallback(
    (
      dogIDResponse: SearchDogsResponse | void,
      dogDetails: DogDetails[]
    ): void => {
      const { search, pagination } = store;

      if (
        search === undefined ||
        pagination === undefined ||
        updateStore === undefined
      )
        return;

      let updatedPagination: PaginationShape = pagination;

      // TODO: Need to tell the store and /search page if there are no results from current query

      if (dogIDResponse !== undefined) {
        // 🔹 Update the pagination in the Store
        updatedPagination = calculatePagination(
          dogIDResponse,
          pagination,
          search.size
        );
      }

      const updatedSearch = formatSearchShape(search, searchQuery);

      const storeUpdate = {
        pagination: updatedPagination,
        search: updatedSearch,
        results: dogDetails
      };

      updateStore((prevState) => ({ ...prevState, ...storeUpdate }));
    },
    [searchQuery, store, updateStore]
  );

  const getDogIDs = useCallback(
    async (searchURL: string): Promise<SearchDogsResponse | void> => {
      try {
        const method: HTTP_METHODS = 'GET';

        const payload = {
          apiURL: searchURL,
          method
        };

        // 🔹 Get the dogIDs from the searchURL
        const res = await makeBackEndRequest<SearchDogsResponse>(payload, true);

        if ('resultIds' in res && Array.isArray(res?.resultIds)) {
          return res;
        }
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log('⚠️ Error in /search page makeSearchRequest hook: ', error);
        console.log('\n');
      }
    },
    []
  );

  // Main function that gets dogIDs and fetches dog data

  /*
    Example of response with no dogIDs

    {
      next: "/dogs/search?ageMin=2&ageMax=15&zipCodes=90045%2C90640&breeds=Airedale%2CBasenji%2CDandie%20Dinmont%2CDhole%2CDingo&size=25&from=25",
      resultIds: [],
      total: 0,
    }
  */
  const searchForDogs = useCallback(
    async (searchURL: string) => {
      updateFlightInfo((prev) => ({
        ...prev,
        ...{ destination: searchURL }
      }));

      const dogIDResponse = await getDogIDs(searchURL);

      console.log(
        'dogIDResponse from getDogIDs in searchForDogs ',
        dogIDResponse
      );
      console.log('\n');

      let foundResults: DogDetails[] = [];

      let userFeedback = '';

      if (
        dogIDResponse !== undefined &&
        dogIDResponse.resultIds &&
        dogIDResponse.resultIds.length > 0
      ) {
        const dogDetails = await fetchDogDetails(dogIDResponse.resultIds);

        console.log(
          'dogDetails from fetchDogDetails in searchForDogs ',
          dogDetails
        );
        console.log('\n');

        if (Array.isArray(dogDetails) && dogDetails.length > 0) {
          foundResults = dogDetails;
        } else {
          userFeedback =
            'It seems there was a problem getting your search results. Try again later.';
        }
      } else {
        userFeedback =
          'There were no results for your search. Try a different search query.';
      }

      if (userFeedback.length > 0) {
        toast.error(userFeedback, { duration: 3000 });
      }

      finalizeStoreUpdate(dogIDResponse, foundResults);
    },
    [getDogIDs, finalizeStoreUpdate]
  );

  useEffect(() => {
    const { apiURL } = searchQuery;

    const { inFlight, destination } = flightInfo;

    const isNewDeparture = destination.length === 0 || destination !== apiURL;

    if (isNewDeparture && inFlight === false) {
      console.log('🔄 Firing makeSearchRequest for URL: ', apiURL);

      updateFlightInfo((prev) => ({
        ...prev,
        ...{ inFlight: true }
      }));

      searchForDogs(apiURL);

      updateFlightInfo((prev) => ({
        ...prev,
        ...{ inFlight: false }
      }));
    }
  }, [
    flightInfo,
    getDogIDs,
    searchForDogs,
    finalizeStoreUpdate,
    updateStore,
    searchQuery
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

  const handlePageChange = (selectedPageNum: number) => {
    if (store?.search && store?.pagination && updateStore) {
      const { pagination, search } = store;

      const { size } = search;
      const { page } = pagination;

      const currentPage = page;

      /* 
         No need to make an API call if user 
         clicked button for current page. 
      */
      if (currentPage === selectedPageNum) return;

      const startIndexAtCurrentPage = currentPage * size - size;

      const distance = Math.abs(selectedPageNum - currentPage);

      const distTimesSize = distance * size;

      const targetIndex =
        selectedPageNum > currentPage
          ? distTimesSize + startIndexAtCurrentPage
          : distTimesSize - startIndexAtCurrentPage;

      const pageUpdate = {
        ...pagination,
        ...{
          page: selectedPageNum,
          from: targetIndex
        }
      };
      console.log('pageUpdate in handlePageChange ', pageUpdate);
      console.log("\n");

      updateStore((prev) => ({ ...prev, ...{ pagination: pageUpdate } }));
    }
  };

  return (
    <div>
      <h1>🔍Search Results</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
      <Pagination paginationOnChange={handlePageChange} />
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
   
   **************************
   *  How Pagination Works  *
   **************************


   - When making the initial search request in the <SearchForm /> by pushing
     the submit button, we never specify the 'from' query parameter.

   - If we make an initial successful request for dogIDs, we get back a SearchDogsResponse
     that we call dogIDResponse in the codebase. This SearchDogsResponse has a "next" property
     that will give you the 'from' query parameter of the starting record index for the next 
     page of search results.

     // SearchDogsResponse Shape

     {
       "next": "/dogs/search?size=25&from=25",
       "resultIds": [...],
       "total": 10000
     }


    At Page 1, you'll save the 'from' query parameter in the store to tell
    the API on subsequent page requests for your current search: 
    
    "I want you to search for all the records based on these search parameters, 
    count up the results to give me the 'total' and then in the 'next' query parameter,
    tell me the starting record index for the next page of results." 
        

    Only Step 4 is different depending on 
      - whether we're going forward to a later page (left to right from Page 1 to Page 5); or
      - we're going backward to an earlier page (right to left from Page 7 to Page 3).

    If we're on Page 1 and wanted to go to Page 3 (the targetPage), we update Store Pagination like so:

    1) Get the current Pagination State:

    {
      page: 1,
      next: 25
    }

    2) Calculate the current starting index of the current page you're on:

    startIndexAtCurrentPage = (currentPage * size) - size 

    3) Calculate the distance between the current page you're on & the targetPage:
    
      distance = Math.abs(targetPage - currentPage)
    
    4) Calculate the targetFromIndex for your targetPage:

       If you're requesting an earlier page (e.g. Page 1 to Page 3), add the startingIndexAtCurrentPage
    
       targetFromIndex = (distance * size) + startIndexAtCurrentPage

       If you're going backwards (e.g. Page 9 to Page 3), subtract the startingIndexAtCurrentPage

       targetFromIndex = (distance * size) - startIndexAtCurrentPage



    5) Create the update object like so:

        {
          page: targetPage, // 3
          from: nextIndex   // 50
        }


  */
