import { useEffect, useContext, useCallback } from 'react';
import { StoreContext } from '../store';
import { makeBackEndRequest, BASE_URL } from '..';

const authURL = `${BASE_URL}/auth/login`;
const TIME_TO_REFRESH = 2; // Should be 55 // See Dev Note #1
const NUM_OF_MINS = 1;
const TIMER_INTERVAL = 60000 * NUM_OF_MINS;

export const useRefreshToken = () => {
  const { store, updateStore } = useContext(StoreContext);

  const handleTokenRefresh = useCallback(async () => {
    if (store.user) {
      try {
        const name = `${store.user.firstName} ${store.user.lastName}`;
        const payload = {
          name,
          email: store.user.email
        };

        const res = await makeBackEndRequest<Response>(
          authURL,
          'POST',
          payload,
          false
        );

        if (res && res.status === 200 && updateStore) {
          const updatedUser = {
            ...store.user,
            ...{ refreshTimer: Date.now() }
          };

          const updatedStore = { ...store, ...{ user: updatedUser } };

          localStorage.setItem('user', JSON.stringify(updatedUser));

          updateStore(updatedStore);
        }
      } catch (error) {
        // TODO: Handle in telemetry.
        console.log(
          'Error in handleTokenRefresh in useRefreshToken Hook: ',
          error
        );
      }
    }
  }, [store, updateStore]);

  useEffect(() => {
    const timerID = setInterval(() => {
      if (store.user?.refreshTimer) {
        const { refreshTimer } = store.user;

        const currentTime = Date.now();

        const diff = currentTime - refreshTimer;
        const elapsed = Math.floor(diff / 60000);

        if (elapsed >= TIME_TO_REFRESH) {
          handleTokenRefresh();
        }
      }
    }, TIMER_INTERVAL);

    return () => clearInterval(timerID);
  }, [handleTokenRefresh, store.user]);
};

/******************************************** 
   * Notes
   ******************************************** 
   
   1) The time to refresh is hardcoded to 55 minutes because the according to 
      the challenge docs, the auth cookie expiers after 1 hour. So at the 55
      minute elapsed mark, might as well refresh the auth token.


  */
