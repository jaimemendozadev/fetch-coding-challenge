import { Dispatch, SetStateAction } from 'react';
import { StoreShape } from '@/utils/store';
import { HTTP_METHODS } from './ts';

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

interface RequestPayload {
  apiURL: string;
  method: HTTP_METHODS;
  bodyPayload?: { [key: string]: any };
}

export const makeBackEndRequest = async <T>(
  requestPayload: RequestPayload,
  parseResult: boolean = true,
  updateStore: Dispatch<SetStateAction<StoreShape>> | undefined = undefined
): Promise<T | void> => {
  const { apiURL, method, bodyPayload } = requestPayload;

  try {
    if (method === 'GET') {
      const result = await fetch(apiURL, {
        method,
        credentials: 'include'
      }).then((res) => (parseResult ? res.json() : res));
      return result;
    }

    const result = await fetch(apiURL, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bodyPayload)
    }).then((res) => (parseResult ? res.json() : res));

    return result;
  } catch (error) {
    // TODO: Handle in telemetry
    console.log(
      `There was an error making a Backend API request to ${apiURL}: `,
      error
    );
    console.log('\n');

    if (
      error instanceof Error &&
      error.message.includes(UNAUTHORIZED_ERROR_MESSAGE) &&
      updateStore
    ) {
      console.log('Error message: ', error.message);
      console.log('\n');

      const reauthRes = await reauthenticateUser(updateStore);

      if (reauthRes.reauthStatus === 200) {
        const updatedReqPayload = { apiURL, method, bodyPayload };
        return makeBackEndRequest(updatedReqPayload, parseResult, updateStore);
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
