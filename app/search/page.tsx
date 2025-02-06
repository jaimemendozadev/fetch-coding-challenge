'use client';
import { ReactNode, useEffect, useContext, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { SearchForm } from '@/components/searchform';
import { BASE_URL, makeBackEndRequest } from '@/utils';
import { StoreContext } from '@/utils/store';
import { HTTP_METHODS } from '@/utils/ts';
import { useSearchParams } from 'next/navigation';

//ageMin ageMax zipCodes breeds
// http://localhost:3000/search?ageMin=2&ageMax=3&zipCodes=90045&breeds=African%20Hunting%20Dog,Basenji,Basset,Beagle,Bedlington%20Terrier

const BASE_SEARCH_URL = `${BASE_URL}/dogs/search?`;

function SearchPage(): ReactNode {
  const router = useRouter();
  const { store, updateStore } = useContext(StoreContext);
  const queryParams = useSearchParams();

  const ageMin = queryParams.get('ageMin');
  const ageMax = queryParams.get('ageMax');
  const zipCodes = queryParams.get('zipCodes');
  const breeds = queryParams.get('breeds');

  console.log('ageMin ', ageMin);
  console.log('\n');

  console.log('ageMax ', ageMax);
  console.log('\n');

  console.log('zipCodes ', zipCodes);
  console.log('\n');

  console.log('breeds ', breeds);
  console.log('\n');

  const handleSearchRedirect = (frontendURL: string) => {
    router.push(frontendURL);
  };

  useEffect(() => {
    if (!store.user) {
      toast.error(
        'You have not registered. Please sign up/sign in to the app to proceed.',
        { duration: 3000 }
      );
      router.push('/');
    }
  }, [router, store.user]);

  useEffect(() => {
    const makeSearchRequest = async (searchURL: string) => {
      try {
        const method: HTTP_METHODS = 'GET';

        const payload = {
          apiURL: searchURL,
          method
        };

        const res = await makeBackEndRequest(payload, true, updateStore);

        console.log('res in SearchForm ', res);
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log('Error in Search Form ', error);
        console.log('\n');
      }
    };

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

    makeSearchRequest(searchURL);
  }, [ageMax, ageMin, breeds, updateStore, zipCodes]);

  return (
    <div>
      <h1>🔍Search Results</h1>
      <SearchForm submitCallback={handleSearchRedirect} />
    </div>
  );
}

// See Dev Note #1
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

   1) Per Vercel Deploy Error logs:
      
      useSearchParams() should be wrapped in a suspense boundary at page "/search". 
      Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

      

  */
