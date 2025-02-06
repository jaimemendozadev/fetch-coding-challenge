import { useEffect, useState, useContext, useCallback } from 'react';
import { makeBackEndRequest, BASE_URL } from '@/utils';
import { HTTP_METHODS, UserShape } from '@/utils/ts';
import { StoreContext } from '@/utils/store';

const authURL = `${BASE_URL}/auth/login`;
const REFRESH_CEILING = 3300000; // 55 minutes

export const useGetUser = (): UserShape | undefined => {
  const { store, updateStore } = useContext(StoreContext);

  const [storedUser, setStoredUser] = useState<UserShape | undefined>(
    undefined
  );

  const handleTokenRefresh = useCallback(
    async (storedUser: UserShape) => {
      try {
        const lastRefresh = storedUser.refreshTimer || 0;
        const now = Date.now();

        // If the last refresh was too recent, skip refresh
        if (now - lastRefresh < REFRESH_CEILING) {
          console.log('Skipping token refresh - recently refreshed.');
          return;
        }

        const name = `${storedUser.firstName} ${storedUser.lastName}`;
        const bodyPayload = {
          name,
          email: storedUser.email
        };

        const method: HTTP_METHODS = 'POST';

        const reqPayload = {
          apiURL: authURL,
          method,
          bodyPayload
        };

        const res = await makeBackEndRequest<Response>(reqPayload, false);

        if (res && res.status === 200 && updateStore) {
          const updatedUser = {
            ...storedUser,
            ...{ refreshTimer: Date.now() }
          };

          const updatedStore = { ...store, ...{ user: updatedUser } };

          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }

          updateStore(updatedStore);
        }
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log(
          'Error in handleTokenRefresh in useRefreshToken Hook: ',
          error
        );
      }
    },
    [store, updateStore]
  );

  useEffect(() => {
    let storedUser: string | null = null;

    if (typeof window !== 'undefined') {
      storedUser = localStorage.getItem('user');
    }

    const storedValue: null | UserShape =
      storedUser === null ? null : JSON.parse(storedUser);

    if (store.user) {
      setStoredUser(store.user);
    } else if (storedValue !== null) {
      // Check if refresh is needed
      const lastRefresh = storedValue.refreshTimer || 0;
      const now = Date.now();

      if (now - lastRefresh >= REFRESH_CEILING) {
        handleTokenRefresh(storedValue);
      } else {
        setStoredUser(storedValue); // Use the stored user immediately
      }
    }
  }, [handleTokenRefresh]);

  return storedUser;
};

/******************************************** 
   * Notes
   ******************************************** 
   
   useGetUser Hook basically checks:
     - the Store Context; or
     - localStorage

   to get the User that was already logged into the app.

   If the User was already in the Store Context, that app hasn't
   crashed or the browser tab hasn't been refreshed.

   If the User was obtained from localStorage, there's a possibility
   the web browser tab was refreshed or closed & the user info is
   still in localStorage. In that case, we may need to refresh 
   the auth tokens to make API calls in protected parts of the app 
   where the user should already have been authenticated.
   
  */
