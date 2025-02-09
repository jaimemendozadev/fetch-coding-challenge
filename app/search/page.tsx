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

    const paginationKeys = [
        'from'
    ]

    const paramsKeys = [
        ...searchKeys,
        ...paginationKeys
    ]

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
    if(updateStore) {
        const {pagination} = store
        const {from, page} = pagination
        const startIndexForNextPage = from;
        const currentPage = page;

        /* 
          No need to make an API call if user 
          clicked button for current page. 
        */
        if(currentPage === selectedPageNum) return;



        // const pageUpdate = {
        //     from,
        //     page: ,
        //     total_pages: 0,
        //     total: 0
        //   }
        updateStore(prev => )
    }
  }

  return (
    <div>
      <h1>🔍Search Results</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
      <Pagination />
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
     that will give you the 'from' query parameter of the starting record index for the next search.

     {
       "next": "/dogs/search?size=25&from=25",
       "resultIds": [...],
       "total": 10000
     }
        

     // TODO  LEFT OFF HERE WRITING DOCS

     So for the first time for Page 1, since we request a 'size' of 25, the 'from' for the next set of records
     is 25.

     Page 2
      next is 50

     Page 3
       next is 75


    If we're on Page 1 and wanted to go to Page 3, update Store Pagination with

    Current Pagination State:
    {
      page: 1,
      next: 25
    }

    Update for Pagination State:

    distance = Math.abs(targetPage - currentPage)
    tagetIndex = distance * size
    {
      page: 3,
      from: targetIndex
    }


  */

