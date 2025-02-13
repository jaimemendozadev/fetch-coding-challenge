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
import { Navigation } from '@/components/navigation';
import { useLocalStorageSync } from '@/utils/hooks/useLocalStorageSync';

const BASE_SEARCH_URL = `${BASE_URL}/dogs/search?`;

function SearchPage(): ReactNode {
  useLocalStorageSync();
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const [flightInfo, updateFlightInfo] = useState({
    inFlight: false,
    destination: ''
  });

  const searchParams = useSearchParams();

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

      updateStore((prev) => ({ ...prev, ...{ pagination: pageUpdate } }));

      const paramsUpdate = { ...search, ...{ from: targetIndex } };

      const nextPageURL = getFrontendSearchURL(paramsUpdate);

      router.push(nextPageURL);
    }
  };

  const toggleDogFavoriting = (dogDetails: DogDetails): void => {
    if (!dogDetails) {
      toast.error(
        "We can't favorite your dog selection right now. 🥺 Try again later.",
        { duration: 3000 }
      );
      return;
    }

    const { favorites } = store;
    const { id } = dogDetails;

    let favoriteLookup: Record<string, DogDetails> = {};

    if (typeof window !== 'undefined') {
      const storedFavorites = localStorage.getItem('favorites');
      favoriteLookup = storedFavorites ? JSON.parse(storedFavorites) : {};
    }

    if (!favorites || !updateStore) return;

    const isFavorited = id in favorites;
    const updatedFavorites = { ...favorites };

    if (isFavorited) {
      delete updatedFavorites[id];
      delete favoriteLookup[id];
    } else {
      updatedFavorites[id] = dogDetails;
      favoriteLookup[id] = dogDetails;
    }

    updateStore((prev) => ({ ...prev, favorites: updatedFavorites }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(favoriteLookup));
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

      if (dogIDResponse !== undefined) {
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

      let foundResults: DogDetails[] = [];

      let userFeedback = '';

      if (
        dogIDResponse !== undefined &&
        dogIDResponse.resultIds &&
        dogIDResponse.resultIds.length > 0
      ) {
        const dogDetails = await fetchDogDetails(dogIDResponse.resultIds);

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

    const hasQueryParams = Object.keys(searchQuery.parameters).length > 0;

    if (isNewDeparture && inFlight === false && hasQueryParams) {
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

  const { results, favorites } = store;

  return (
    <div className="p-8">
      <Navigation />
      <h1 className="text-6xl mb-14">🔍Search Page</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
      <Pagination paginationOnChange={handlePageChange} />

      <div className="max-w-[80%] flex flex-wrap justify-between mr-auto ml-auto">
        {results?.map((dogDetails) => {
          let favoriteStatus = false;

          if (favorites && Object.hasOwn(favorites, dogDetails.id)) {
            favoriteStatus = true;
          }

          return (
            <DogCard
              key={dogDetails.id}
              isFavorited={favoriteStatus}
              favoriteHandler={toggleDogFavoriting}
              dogPayload={dogDetails}
            />
          );
        })}
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
