import { Dispatch, SetStateAction } from 'react';
import { StoreShape } from '@/utils/store';
import { RequestPayload } from './ts';

export const BASE_URL = 'https://frontend-take-home-service.fetch.com';
export const AUTH_URL = `${BASE_URL}/auth/login`;
export const UNAUTHORIZED_ERROR_MESSAGE = '"Unauthorized" is not valid JSON';

// See Dev Note #1
export const validateEmail = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const reauthenticateUser = async (
  updateStore: Dispatch<SetStateAction<StoreShape>>
): Promise<{ reauthStatus: number }> => {
  try {
    let storedUser: string | null = null;

    if (typeof window !== 'undefined') {
      storedUser = localStorage.getItem('user');
    }
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
    }).then((res) => res);

    if (!res || res.status !== 200) {
      console.error('Reauthentication failed.');
      return { reauthStatus: 400 };
    }

    const updatedUser = {
      firstName,
      lastName,
      email,
      refreshTimer: Date.now()
    };

    if (typeof window !== 'undefined') {
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    // Update React Context
    updateStore((prevStore) => ({
      ...prevStore,
      ...{ user: updatedUser }
    }));

    console.log('User successfully reauthenticated and store updated.');

    return { reauthStatus: 200 };
  } catch (error) {
    // TODO: Handle in telemetry.
    console.error('Error during reauthentication:', error);
    console.log('\n');
  }

  return { reauthStatus: 400 };
};

const callAPI = async <T>(
  requestPayload: RequestPayload,
  parseResult: boolean = true
): Promise<T> => {
  const { apiURL, method, bodyPayload } = requestPayload;

  const response = await fetch(apiURL, {
    method,
    credentials: 'include',
    headers: method !== 'GET' ? { 'Content-Type': 'application/json' } : {},
    body: method === 'GET' ? undefined : JSON.stringify(bodyPayload ?? {})
  });

  if (!response.ok) {
    throw new Error(
      `callAPI Error: ${response.status} - ${response.statusText}`
    );
  }

  return parseResult ? response.json() : response;
};

// 2-6-2025 TODO: make return type null instead of void? 🤔
export const makeBackEndRequest = async <T>(
  requestPayload: RequestPayload,
  parseResult: boolean = true,
  updateStore: Dispatch<SetStateAction<StoreShape>> | undefined = undefined
): Promise<T | void> => {
  const { apiURL } = requestPayload;

  try {
    const result = await callAPI<T>(requestPayload, parseResult);

    return result;
  } catch (error) {
    // TODO: Handle in telemetry
    console.error(`❌ Error in makeBackEndRequest to ${apiURL}: `, error);

    if (error instanceof Error) {
      console.error(`🛑 Error details: ${error.message}`);
    }

    // 🔹 Distinguish between API errors & network failures
    if (
      error instanceof Error &&
      error.message?.startsWith('callAPI Error: 401') &&
      updateStore
    ) {
      console.warn('Attempting to reauthenticate user...');

      const reauthRes = await reauthenticateUser(updateStore);

      if (reauthRes.reauthStatus === 200) {
        console.warn(`Retrying request for: ${apiURL}`);

        try {
          return await callAPI<T>(requestPayload, parseResult);
        } catch (retryError) {
          console.error(`Retry failed for ${apiURL}: `, retryError);
        }
      }
    }
  }

  return undefined;
};

/******************************************** 
   * Notes
   ******************************************** 
   
   1) Source of validateEmail Function:
      https://search.brave.com/search?q=javascript+regex+to+validate+an+email&source=desktop&conversation=e4edc873f6330f8b9a6aaf&summary=1



  */
