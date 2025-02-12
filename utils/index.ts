import { DogDetails, RequestPayload } from '@/utils/ts';
export const BASE_URL = 'https://frontend-take-home-service.fetch.com';
export const AUTH_URL = `${BASE_URL}/auth/login`;
export const UNAUTHORIZED_STATUS = 401;

interface CallAPIError {
  error: boolean;
  status: number;
  statusText: string;
}

// See Dev Note #1
export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const makeBackEndRequest = async <T>(
  requestPayload: RequestPayload,
  parseResult: boolean = true
): Promise<T | CallAPIError> => {
  const { apiURL, method, bodyPayload } = requestPayload;

  try {
    const response = await fetch(apiURL, {
      method,
      credentials: 'include',
      headers: method !== 'GET' ? { 'Content-Type': 'application/json' } : {},
      body: method === 'GET' ? undefined : JSON.stringify(bodyPayload ?? {})
    });

    console.log('📝 response in makeBackEndRequest function: ', response);

    if (!response.ok) {
      return {
        error: true,
        status: response.status,
        statusText: response.statusText
      };
    }

    return parseResult ? response.json() : response;
  } catch (error) {
    console.error(`❌ Network Error: Unable to reach ${apiURL}`, error);
  }

  return { error: true, status: 500, statusText: 'Network Error' };
};

export const fetchDogDetails = async (
  dogIDs: string[]
): Promise<DogDetails[]> => {
  const chunkSize = 100;
  const batches = [];

  for (let index = 0; index < dogIDs.length; index += chunkSize) {
    batches.push(dogIDs.slice(index, index + chunkSize));
  }

  const results = await Promise.allSettled(
    batches.map(async (batch) => {
      try {
        const response = await fetch(`${BASE_URL}/dogs`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        throw new Error(`Batch request failed: ${error}`);
      }
    })
  );

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Batch ${index + 1} failed:`, result.reason);
    }
  });

  return results
    .filter((result) => result.status === 'fulfilled')
    .flatMap(
      (result) => (result as PromiseFulfilledResult<DogDetails[]>).value
    );
};

/******************************************** 
   * Notes
   ******************************************** 
   
   1) Source of validateEmail Function:
      https://search.brave.com/search?q=javascript+regex+to+validate+an+email&source=desktop&conversation=e4edc873f6330f8b9a6aaf&summary=1

  */
