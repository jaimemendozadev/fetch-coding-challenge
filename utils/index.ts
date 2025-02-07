import { Dispatch, SetStateAction } from 'react';
import { DEFAULT_RESULT_SIZE, DEFAULT_SORT, StoreShape } from '@/utils/store';
import { RequestPayload, SearchShape } from './ts';

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

export const reauthenticateUser = async (
  updateStore: Dispatch<SetStateAction<StoreShape>>
): Promise<{ reauthStatus: number }> => {
  try {
    const storedUser =
      typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!storedUser) {
      console.warn('No user stored in localStorage. Cannot reauthenticate.');
      return { reauthStatus: 400 };
    }

    const { firstName, lastName, email } = JSON.parse(storedUser);
    const name = `${firstName} ${lastName}`;

    const res = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email })
    });

    if (!res.ok) {
      console.error(
        `Reauthentication failed: ${res.status} - ${res.statusText}`
      );
      return { reauthStatus: res.status };
    }

    const updatedUser = {
      firstName,
      lastName,
      email,
      refreshTimer: Date.now()
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    updateStore((prevStore) => ({ ...prevStore, user: updatedUser }));

    console.log('✅ User successfully reauthenticated and store updated.');
    return { reauthStatus: 200 };
  } catch (error) {
    console.error('Error during reauthentication:', error);
    return { reauthStatus: 400 };
  }
};

const callAPI = async <T>(
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

    console.log('📝 response in callAPI function: ', response);

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
    return { error: true, status: 500, statusText: 'Network Error' };
  }
};

// 🔹 Type guard to check if the response is an error
const isCallAPIError = (response: any): response is CallAPIError => {
  return response && typeof response === 'object' && 'error' in response;
};

export const makeBackEndRequest = async <T>(
  requestPayload: RequestPayload,
  parseResult: boolean = true,
  updateStore?: Dispatch<SetStateAction<StoreShape>>
): Promise<T | undefined> => {
  const { apiURL } = requestPayload;

  let result = await callAPI<T>(requestPayload, parseResult);

  // 🔹 Use the type guard function to check for API errors
  if (isCallAPIError(result)) {
    console.error(`❌ API Error: ${result.status} - ${result.statusText}`);

    // 🔹 Detect 401 Unauthorized errors correctly
    if (result.status === UNAUTHORIZED_STATUS && updateStore) {
      console.warn('🔄 Attempting to reauthenticate user...');

      const reauthRes = await reauthenticateUser(updateStore);
      if (reauthRes.reauthStatus !== 200) return undefined;

      console.warn(`🔁 Retrying request for: ${apiURL}`);
      result = await callAPI<T>(requestPayload, parseResult);

      return isCallAPIError(result) ? undefined : result;
    }

    return undefined;
  }

  return result;
};

/******************************************** 
   * Notes
   ******************************************** 
   
   1) Source of validateEmail Function:
      https://search.brave.com/search?q=javascript+regex+to+validate+an+email&source=desktop&conversation=e4edc873f6330f8b9a6aaf&summary=1


   2) Added just in case there somehow was no sort query
      parameter. Better to add the default sort paramater
      to be saved in the Store for subsequent API requests.   

  */
