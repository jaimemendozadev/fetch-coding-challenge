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
import { getFrontendSearchURL } from '@/components/searchform/utils';
import { DogCard } from '@/components/dogcard';

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
      console.log('\n');

      updateStore((prev) => ({ ...prev, ...{ pagination: pageUpdate } }));

      const paramsUpdate = { ...search, ...{ from: targetIndex } };

      const nextPageURL = getFrontendSearchURL(paramsUpdate);

      router.push(nextPageURL);
    }
  };

  const addDogToFavorites = async (dogID: string) => {
    if (!dogID) {
      toast.error(
        "We can't favorite your dog selection right now. 🥺 Try again later.",
        { duration: 3000 }
      );
      return;
    }

    try {
    } catch (error) {
      // TODO: Handle in telemetry
      console.log('Error in addDogToFavorites function: ', error);
      console.log('\n');
    }
  };

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

          if (updateStore) {
            updateStore((prev) => ({ ...prev, ...{ results: foundResults } }));
          }
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
    [getDogIDs, finalizeStoreUpdate, updateStore]
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

  const { results } = store;

  return (
    <div className="p-8">
      <h1 className="text-6xl mb-14">🔍Search Results</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
      <Pagination paginationOnChange={handlePageChange} />

      <div className="max-w-[80%] flex flex-wrap justify-between border border-gray-900 mr-auto ml-auto">
        {results?.map((dogDetails) => (
          <DogCard key={dogDetails.id} favoriteHandler={addDogToFavorites} {...dogDetails} />
        ))}
      </div>
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
